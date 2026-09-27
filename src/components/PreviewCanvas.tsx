import React, { useEffect, useRef, useState } from 'react';
import {
  A4_WIDTH_MM,
  A4_HEIGHT_MM,
  calculateCardSlots,
  calculateCutLines,
} from '../constants/layout';
import { LayoutConfig, UploadedImageData } from '../types';
import { ZoomIn, ZoomOut, Eye, EyeOff, Ruler, Layers } from 'lucide-react';

interface PreviewCanvasProps {
  frontImage: UploadedImageData | null;
  backImage: UploadedImageData | null;
  config: LayoutConfig;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  frontImage,
  backImage,
  config,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [showDimensions, setShowDimensions] = useState(true);
  const [showSlotLabels, setShowSlotLabels] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Auto switch back to front if back image is removed
  useEffect(() => {
    if (!backImage && activeSide === 'back') {
      setActiveSide('front');
    }
  }, [backImage, activeSide]);

  // Main canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 4;
    const canvasWidth = A4_WIDTH_MM * scale;
    const canvasHeight = A4_HEIGHT_MM * scale;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const isBackSide = activeSide === 'back';
    const currentImgData = isBackSide ? backImage : frontImage;

    if (!currentImgData) {
      renderEmptySheet(ctx, scale, config);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      renderSheetWithImage(ctx, img, scale, config, isBackSide, showDimensions, showSlotLabels);
    };
    img.src = currentImgData.dataUrl;
  }, [frontImage, backImage, config, activeSide, showDimensions, showSlotLabels]);

  const renderEmptySheet = (
    ctx: CanvasRenderingContext2D,
    scale: number,
    cfg: LayoutConfig
  ) => {
    const slots = calculateCardSlots(cfg);
    const cutLines = calculateCutLines(cfg);

    slots.forEach((slot) => {
      const x = slot.xMm * scale;
      const y = slot.yMm * scale;
      const w = slot.widthMm * scale;
      const h = slot.heightMm * scale;

      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      ctx.fillStyle = '#94a3b8';
      ctx.font = `600 ${13 * (scale / 4)}px 'Noto Sans JP', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `#0${slot.index + 1} (${slot.widthMm.toFixed(1)}×${slot.heightMm.toFixed(1)}mm)`,
        x + w / 2,
        y + h / 2
      );
    });

    renderCutLines(ctx, cutLines, scale, cfg, false);
  };

  const renderSingleCard = (
    img: HTMLImageElement,
    scale: number,
    cfg: LayoutConfig,
    targetWidthMm: number,
    targetHeightMm: number
  ): HTMLCanvasElement => {
    const cardPxW = targetWidthMm * scale;
    const cardPxH = targetHeightMm * scale;

    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = cardPxW;
    cardCanvas.height = cardPxH;
    const cardCtx = cardCanvas.getContext('2d');

    if (cardCtx) {
      cardCtx.fillStyle = cfg.backgroundColor || '#ffffff';
      cardCtx.fillRect(0, 0, cardPxW, cardPxH);

      cardCtx.save();
      cardCtx.translate(cardPxW / 2, cardPxH / 2);
      if (cfg.rotation !== 0) {
        cardCtx.rotate((cfg.rotation * Math.PI) / 180);
      }
      if (cfg.flipHorizontal || cfg.flipVertical) {
        cardCtx.scale(cfg.flipHorizontal ? -1 : 1, cfg.flipVertical ? -1 : 1);
      }

      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;
      const imgAspect = imgW / imgH;
      const cardAspect = targetWidthMm / targetHeightMm;

      const isRotated90 = cfg.rotation % 180 !== 0;
      const effectiveCardAspect = isRotated90 ? 1 / cardAspect : cardAspect;

      let drawW = cardPxW;
      let drawH = cardPxH;

      if (cfg.fitMode === 'cover') {
        if (imgAspect > effectiveCardAspect) {
          drawH = isRotated90 ? cardPxW : cardPxH;
          drawW = drawH * imgAspect;
        } else {
          drawW = isRotated90 ? cardPxH : cardPxW;
          drawH = drawW / imgAspect;
        }
      } else if (cfg.fitMode === 'contain') {
        if (imgAspect > effectiveCardAspect) {
          drawW = isRotated90 ? cardPxH : cardPxW;
          drawH = drawW / imgAspect;
        } else {
          drawH = isRotated90 ? cardPxW : cardPxH;
          drawW = drawH * imgAspect;
        }
      } else {
        drawW = isRotated90 ? cardPxH : cardPxW;
        drawH = isRotated90 ? cardPxW : cardPxH;
      }

      cardCtx.imageSmoothingEnabled = true;
      cardCtx.imageSmoothingQuality = 'high';
      cardCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      cardCtx.restore();
    }

    return cardCanvas;
  };

  const renderSheetWithImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    scale: number,
    cfg: LayoutConfig,
    isBackSide: boolean,
    dims: boolean,
    labels: boolean
  ) => {
    const slots = calculateCardSlots(cfg);
    const cutLines = calculateCutLines(cfg);

    // Pre-render canvases for top cards and bottom cards
    const topCardCanvas = renderSingleCard(img, scale, cfg, cfg.cardWidthMm, cfg.cardHeightMm);

    // Draw all 6 slots on sheet
    slots.forEach((slot) => {
      let xMm = slot.xMm;
      if (isBackSide) {
        xMm = A4_WIDTH_MM - slot.xMm - slot.widthMm;
      }

      const x = xMm * scale;
      const y = slot.yMm * scale;
      const w = slot.widthMm * scale;
      const h = slot.heightMm * scale;

      ctx.save();
      if (slot.row === 'top') {
        ctx.drawImage(topCardCanvas, x, y, w, h);
      } else {
        // Render bottom card with its target dimensions (e.g. 67.5 x 135 mm)
        const bottomCardCanvas = renderSingleCard(
          img,
          scale,
          cfg,
          slot.targetCardWidthMm,
          slot.targetCardHeightMm
        );
        const cardPxW = slot.targetCardWidthMm * scale;
        const cardPxH = slot.targetCardHeightMm * scale;

        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((slot.rotationDeg * Math.PI) / 180);
        ctx.drawImage(bottomCardCanvas, -cardPxW / 2, -cardPxH / 2, cardPxW, cardPxH);
      }
      ctx.restore();

      // Card slot label overlay
      if (labels) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;

        const badgeW = 28 * (scale / 4);
        const badgeH = 22 * (scale / 4);
        const badgeX = x + 6 * (scale / 4);
        const badgeY = y + 6 * (scale / 4);

        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${11 * (scale / 4)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`#${slot.index + 1}`, badgeX + badgeW / 2, badgeY + badgeH / 2);

        if (slot.row === 'bottom') {
          ctx.font = `${10 * (scale / 4)}px 'Noto Sans JP', sans-serif`;
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(`↻${slot.rotationDeg}°`, badgeX + badgeW + 20 * (scale / 4), badgeY + badgeH / 2);
        }
        ctx.restore();
      }
    });

    // Cutlines
    renderCutLines(ctx, cutLines, scale, cfg, isBackSide);

    // Dimensions overlay
    if (dims) {
      renderDimensionGuides(ctx, scale, cfg);
    }
  };

  const renderCutLines = (
    ctx: CanvasRenderingContext2D,
    cutLines: ReturnType<typeof calculateCutLines>,
    scale: number,
    cfg: LayoutConfig,
    isBackSide: boolean
  ) => {
    if (cfg.cutLineStyle === 'none') return;

    ctx.save();
    let strokeColor = '#334155'; // darkGray
    if (cfg.cutLineColor === 'gray') strokeColor = '#94a3b8';
    if (cfg.cutLineColor === 'black') strokeColor = '#000000';
    if (cfg.cutLineColor === 'lightCyan') strokeColor = '#06b6d4';

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(1, (cfg.cutLineWidthPt || 0.35) * (scale / 1.5));

    if (cfg.cutLineStyle === 'dashed') {
      ctx.setLineDash([8, 6]);
    } else {
      ctx.setLineDash([]);
    }

    cutLines.forEach((line) => {
      ctx.beginPath();
      if (line.type === 'horizontal') {
        const y = line.posMm * scale;
        const xStart = (line.fromMm !== undefined ? line.fromMm : 0) * scale;
        const xEnd = (line.toMm !== undefined ? line.toMm : A4_WIDTH_MM) * scale;
        ctx.moveTo(xStart, y);
        ctx.lineTo(xEnd, y);
      } else {
        let xMm = line.posMm;
        if (isBackSide) {
          xMm = A4_WIDTH_MM - line.posMm;
        }
        const x = xMm * scale;
        const yStart = (line.fromMm !== undefined ? line.fromMm : 0) * scale;
        const yEnd = (line.toMm !== undefined ? line.toMm : A4_HEIGHT_MM) * scale;
        ctx.moveTo(x, yStart);
        ctx.lineTo(x, yEnd);
      }
      ctx.stroke();
    });

    ctx.restore();
  };

  const renderDimensionGuides = (
    ctx: CanvasRenderingContext2D,
    scale: number,
    cfg: LayoutConfig
  ) => {
    ctx.save();
    ctx.fillStyle = '#6366f1';
    ctx.font = `600 ${10 * (scale / 4)}px 'Noto Sans JP', sans-serif`;

    const topMargin = (A4_HEIGHT_MM - (cfg.cardHeightMm + cfg.cardWidthMm)) / 2;
    const leftMargin = (A4_WIDTH_MM - cfg.cardWidthMm * 4) / 2;

    ctx.textAlign = 'left';
    ctx.fillText(`余白: ${topMargin.toFixed(1)}mm`, (leftMargin + 4) * scale, 8 * scale);

    ctx.textAlign = 'left';
    ctx.fillText(`余白: ${leftMargin.toFixed(1)}mm`, 4 * scale, (topMargin + 14) * scale);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`A4 (297 × 210 mm)`, (A4_WIDTH_MM - 6) * scale, (A4_HEIGHT_MM - 4) * scale);

    ctx.restore();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800 p-4 shadow-xl">
      {/* Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {backImage && (
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveSide('front')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeSide === 'front'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                表面プレビュー
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('back')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeSide === 'back'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                裏面プレビュー (反転位置)
              </button>
            </div>
          )}

          {!backImage && (
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              A4用紙 プレビュー (297 × 210 mm)
            </span>
          )}
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDimensions(!showDimensions)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 border transition-colors cursor-pointer ${
              showDimensions
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="寸法ガイドの表示/非表示"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">寸法</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSlotLabels(!showSlotLabels)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 border transition-colors cursor-pointer ${
              showSlotLabels
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="カード番号の表示/非表示"
          >
            {showSlotLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">番号</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 ml-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              title="縮小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-400 px-1 font-mono">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
              className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              title="拡大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 overflow-auto min-h-[360px] sm:min-h-[460px] bg-slate-900/70 rounded-xl relative"
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className="shadow-2xl shadow-black/80 rounded-sm ring-1 ring-slate-700/60 transition-all max-w-full"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-auto block rounded-sm bg-white"
            style={{
              aspectRatio: '297 / 210',
              maxHeight: '68vh',
            }}
          />
        </div>
      </div>

      {/* Sheet bottom hint */}
      <div className="flex items-center justify-between pt-3 text-[11px] text-slate-500">
        <span>
          {config.snapBottomToColumns
            ? '⚡ 共通カット線モード有効: 縦5本・横3本の直線カットだけで全6枚が完成'
            : '上段: 縦向き 4枚 / 下段: 90°回転 2枚 (計6枚)'}
        </span>
        <span>印刷時は「拡大縮小なし / 100%」を推奨</span>
      </div>
    </div>
  );
};
