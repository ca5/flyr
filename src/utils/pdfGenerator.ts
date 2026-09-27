import { PDFDocument, rgb, LineCapStyle } from 'pdf-lib';
import {
  A4_WIDTH_MM,
  A4_HEIGHT_MM,
  MM_TO_PT,
  calculateCardSlots,
  calculateCutLines,
} from '../constants/layout';
import { LayoutConfig, UploadedImageData } from '../types';

/**
 * Renders an image to an offscreen high-res canvas (300 DPI)
 * with the specified fit mode, transforms, background padding, and optional rotation.
 */
export async function renderCardImageToCanvas(
  imgData: UploadedImageData,
  config: LayoutConfig,
  targetWidthMm: number,
  targetHeightMm: number,
  slotRotationDeg: number = 0,
  dpi: number = 300
): Promise<HTMLCanvasElement> {
  const mmToInch = 1 / 25.4;
  // If slotRotationDeg is 90 or 270, the physical slot dimensions are swapped (targetHeightMm x targetWidthMm)
  const isSlotRotated90 = slotRotationDeg % 180 !== 0;
  const canvasWidthMm = isSlotRotated90 ? targetHeightMm : targetWidthMm;
  const canvasHeightMm = isSlotRotated90 ? targetWidthMm : targetHeightMm;

  const canvasWidth = Math.round(canvasWidthMm * mmToInch * dpi);
  const canvasHeight = Math.round(canvasHeightMm * mmToInch * dpi);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Background
  ctx.fillStyle = config.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Load image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imgData.dataUrl;
  });

  ctx.save();

  // 1. Slot-level rotation (e.g. 270 deg for bottom row)
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  if (slotRotationDeg !== 0) {
    ctx.rotate((slotRotationDeg * Math.PI) / 180);
  }

  // Logical unrotated card dimensions
  const cardPxW = Math.round(targetWidthMm * mmToInch * dpi);
  const cardPxH = Math.round(targetHeightMm * mmToInch * dpi);

  // 2. User image rotation and flip
  if (config.rotation !== 0) {
    ctx.rotate((config.rotation * Math.PI) / 180);
  }
  if (config.flipHorizontal || config.flipVertical) {
    ctx.scale(config.flipHorizontal ? -1 : 1, config.flipVertical ? -1 : 1);
  }

  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  const imgAspect = imgW / imgH;
  const cardAspect = targetWidthMm / targetHeightMm;

  const isUserRotated90 = config.rotation % 180 !== 0;
  const effectiveCardAspect = isUserRotated90 ? 1 / cardAspect : cardAspect;

  let drawW = cardPxW;
  let drawH = cardPxH;

  if (config.fitMode === 'cover') {
    if (imgAspect > effectiveCardAspect) {
      drawH = isUserRotated90 ? cardPxW : cardPxH;
      drawW = drawH * imgAspect;
    } else {
      drawW = isUserRotated90 ? cardPxH : cardPxW;
      drawH = drawW / imgAspect;
    }
  } else if (config.fitMode === 'contain') {
    if (imgAspect > effectiveCardAspect) {
      drawW = isUserRotated90 ? cardPxH : cardPxW;
      drawH = drawW / imgAspect;
    } else {
      drawH = isUserRotated90 ? cardPxW : cardPxH;
      drawW = drawH * imgAspect;
    }
  } else {
    drawW = isUserRotated90 ? cardPxH : cardPxW;
    drawH = isUserRotated90 ? cardPxW : cardPxH;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  return canvas;
}

/**
 * Generate a PDF document representing the A4 sheet with 6 flyers and cutting lines.
 */
export async function generateFlyerPDF(
  frontImage: UploadedImageData,
  backImage: UploadedImageData | null,
  config: LayoutConfig
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Render front page
  await renderSheetPage(pdfDoc, frontImage, config, false);

  // If back image is provided, render back page (mirrored for double-sided alignment)
  if (backImage) {
    await renderSheetPage(pdfDoc, backImage, config, true);
  }

  return await pdfDoc.save();
}

/**
 * Helper to render one full A4 sheet page (front or mirrored back)
 */
async function renderSheetPage(
  pdfDoc: PDFDocument,
  imgData: UploadedImageData,
  config: LayoutConfig,
  isBackSide: boolean
) {
  const pageWidthPt = A4_WIDTH_MM * MM_TO_PT;
  const pageHeightPt = A4_HEIGHT_MM * MM_TO_PT;

  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
  const slots = calculateCardSlots(config);
  const cutLines = calculateCutLines(config);

  // 1. Render and embed normal card (for top row)
  const topCanvas = await renderCardImageToCanvas(
    imgData,
    config,
    config.cardWidthMm,
    config.cardHeightMm,
    0,
    300
  );
  const topBlob = await new Promise<Blob>((resolve) =>
    topCanvas.toBlob((b) => resolve(b!), 'image/png')
  );
  const topBytes = await topBlob.arrayBuffer();
  const topPdfImage = await pdfDoc.embedPng(topBytes);

  // 2. Render bottom row cards (accounting for targetCardHeightMm and slot rotation)
  const bottomImagesMap = new Map<string, any>();
  for (const slot of slots) {
    if (slot.row === 'bottom') {
      const key = `${slot.rotationDeg}_${slot.targetCardHeightMm}`;
      if (!bottomImagesMap.has(key)) {
        const bCanvas = await renderCardImageToCanvas(
          imgData,
          config,
          slot.targetCardWidthMm,
          slot.targetCardHeightMm,
          slot.rotationDeg,
          300
        );
        const bBlob = await new Promise<Blob>((resolve) =>
          bCanvas.toBlob((b) => resolve(b!), 'image/png')
        );
        const bBytes = await bBlob.arrayBuffer();
        const bPdfImage = await pdfDoc.embedPng(bBytes);
        bottomImagesMap.set(key, bPdfImage);
      }
    }
  }

  // Draw card slots onto PDF page
  for (const slot of slots) {
    let xMm = slot.xMm;
    if (isBackSide) {
      xMm = A4_WIDTH_MM - slot.xMm - slot.widthMm;
    }

    const xPt = xMm * MM_TO_PT;
    const yTopMm = slot.yMm;
    const yBottomMm = yTopMm + slot.heightMm;
    const yPt = (A4_HEIGHT_MM - yBottomMm) * MM_TO_PT;
    const wPt = slot.widthMm * MM_TO_PT;
    const hPt = slot.heightMm * MM_TO_PT;

    if (slot.row === 'top') {
      page.drawImage(topPdfImage, {
        x: xPt,
        y: yPt,
        width: wPt,
        height: hPt,
      });
    } else {
      const key = `${slot.rotationDeg}_${slot.targetCardHeightMm}`;
      const bottomPdfImage = bottomImagesMap.get(key);
      if (bottomPdfImage) {
        page.drawImage(bottomPdfImage, {
          x: xPt,
          y: yPt,
          width: wPt,
          height: hPt,
        });
      }
    }
  }

  // Draw cut lines
  if (config.cutLineStyle !== 'none') {
    let lineColor = rgb(0.3, 0.3, 0.3); // darkGray
    if (config.cutLineColor === 'gray') {
      lineColor = rgb(0.65, 0.65, 0.65);
    } else if (config.cutLineColor === 'black') {
      lineColor = rgb(0, 0, 0);
    } else if (config.cutLineColor === 'lightCyan') {
      lineColor = rgb(0.05, 0.75, 0.85);
    }

    const isDashed = config.cutLineStyle === 'dashed';
    const dashArray = isDashed ? [4, 3] : undefined;
    const thickness = config.cutLineWidthPt || 0.35;

    for (const line of cutLines) {
      if (line.type === 'horizontal') {
        const yPt = (A4_HEIGHT_MM - line.posMm) * MM_TO_PT;
        const xStartPt = (line.fromMm !== undefined ? line.fromMm : 0) * MM_TO_PT;
        const xEndPt = (line.toMm !== undefined ? line.toMm : A4_WIDTH_MM) * MM_TO_PT;

        page.drawLine({
          start: { x: xStartPt, y: yPt },
          end: { x: xEndPt, y: yPt },
          thickness: line.isSecondary ? thickness * 0.75 : thickness,
          color: lineColor,
          dashArray,
          lineCap: LineCapStyle.Projecting,
        });
      } else {
        // Vertical line
        let xMm = line.posMm;
        if (isBackSide) {
          xMm = A4_WIDTH_MM - line.posMm;
        }
        const xPt = xMm * MM_TO_PT;
        const yStartMm = line.fromMm !== undefined ? line.fromMm : 0;
        const yEndMm = line.toMm !== undefined ? line.toMm : A4_HEIGHT_MM;

        const yStartPt = (A4_HEIGHT_MM - yEndMm) * MM_TO_PT;
        const yEndPt = (A4_HEIGHT_MM - yStartMm) * MM_TO_PT;

        page.drawLine({
          start: { x: xPt, y: yStartPt },
          end: { x: xPt, y: yEndPt },
          thickness: line.isSecondary ? thickness * 0.75 : thickness,
          color: lineColor,
          dashArray,
          lineCap: LineCapStyle.Projecting,
        });
      }
    }
  }
}
