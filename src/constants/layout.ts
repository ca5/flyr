import { LayoutConfig, CardSlot, CutLine } from '../types';

export const A4_WIDTH_MM = 297.0;
export const A4_HEIGHT_MM = 210.0;

export const MM_TO_PT = 72.0 / 25.4; // 2.8346456692913384
export const PT_TO_MM = 25.4 / 72.0; // 0.3527777777777778

export const A4_WIDTH_PT = A4_WIDTH_MM * MM_TO_PT;   // 841.88976 pt
export const A4_HEIGHT_PT = A4_HEIGHT_MM * MM_TO_PT; // 595.27559 pt

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  cardWidthMm: 70.25,
  cardHeightMm: 99.37,
  autoAspectFit: true,     // Automatically fit card dimensions to image aspect ratio (Zero gap between top & bottom!)
  snapBottomToColumns: true, // Snap bottom row cards to top columns
  fitMode: 'cover',
  backgroundColor: '#ffffff',
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  bottomRowRotation: 'ccw', // ccw = 270 deg (head faces left, matches sample PDF)
  bottomRowAlign: 'outer',
  cutLineStyle: 'solid',
  cutLineColor: 'darkGray',
  cutLineWidthPt: 0.35,
  includeInnerCutLines: false,
  includeCenterFoldLine: false,
  addBleedMarks: false,
};

/**
 * Calculates optimal card width and height (mm) for A4 landscape 6-card layout
 * so that the card aspect ratio EXACTLY matches the image aspect ratio,
 * leaving ZERO unwanted white padding between top and bottom cards.
 */
export function calculateOptimalCardDimensions(imageAspectRatio: number): {
  cardWidthMm: number;
  cardHeightMm: number;
} {
  if (!imageAspectRatio || imageAspectRatio <= 0 || !isFinite(imageAspectRatio)) {
    return { cardWidthMm: 67.5, cardHeightMm: 120.0 };
  }

  // Minimum printable margins around A4 sheet (8mm on sides, 8mm on top/bottom)
  const minMarginX = 8.0;
  const minMarginY = 8.0;

  const availableW = A4_WIDTH_MM - 2 * minMarginX; // 281.0 mm
  const availableH = A4_HEIGHT_MM - 2 * minMarginY; // 194.0 mm

  // Constraint 1: 4 cards wide -> 4 * cw <= availableW
  const maxCwFromWidth = availableW / 4; // 70.25 mm

  // Constraint 2: 1 vertical card (height = ch = cw / aspect) + 1 rotated card (height = cw) <= availableH
  const maxCwFromHeight = availableH / (1 + 1 / imageAspectRatio);

  // Take the constraining width
  const cw = Math.min(maxCwFromWidth, maxCwFromHeight);
  const ch = cw / imageAspectRatio;

  return {
    cardWidthMm: Math.round(cw * 100) / 100,
    cardHeightMm: Math.round(ch * 100) / 100,
  };
}

/**
 * Calculates the positions of the 6 card slots on the A4 page in millimeters.
 * (Origin: top-left (0,0) of the sheet)
 */
export function calculateCardSlots(config: LayoutConfig): CardSlot[] {
  const { cardWidthMm: cw, cardHeightMm: ch, snapBottomToColumns, bottomRowRotation, bottomRowAlign } = config;
  const slots: CardSlot[] = [];

  // Margins
  const topMargin = (A4_HEIGHT_MM - (ch + cw)) / 2;
  const leftMargin = (A4_WIDTH_MM - cw * 4) / 2;

  // 1. Top row (4 portrait cards)
  for (let i = 0; i < 4; i++) {
    slots.push({
      index: i,
      row: 'top',
      xMm: leftMargin + i * cw,
      yMm: topMargin,
      widthMm: cw,
      heightMm: ch,
      rotationDeg: 0,
      targetCardWidthMm: cw,
      targetCardHeightMm: ch,
    });
  }

  // 2. Bottom row (2 cards rotated 90 degrees)
  const bottomY = topMargin + ch;
  const bottomCardH = cw;

  let bottomCardW = ch;
  let x1 = leftMargin;
  let x2 = leftMargin + 4 * cw - bottomCardW;

  if (snapBottomToColumns) {
    bottomCardW = cw * 2;
    x1 = leftMargin;
    x2 = leftMargin + cw * 2;
  } else {
    if (bottomRowAlign === 'center') {
      const spacing = 10;
      const totalW = bottomCardW * 2 + spacing;
      x1 = (A4_WIDTH_MM - totalW) / 2;
      x2 = x1 + bottomCardW + spacing;
    } else if (bottomRowAlign === 'left') {
      x1 = leftMargin;
      x2 = leftMargin + bottomCardW + 10;
    } else if (bottomRowAlign === 'right') {
      x2 = A4_WIDTH_MM - leftMargin - bottomCardW;
      x1 = x2 - bottomCardW - 10;
    }
  }

  // Rotation degree for bottom cards
  let rot1 = 270;
  let rot2 = 270;
  if (bottomRowRotation === 'ccw') {
    rot1 = 270;
    rot2 = 270;
  } else if (bottomRowRotation === 'cw') {
    rot1 = 90;
    rot2 = 90;
  } else if (bottomRowRotation === 'inward') {
    rot1 = 90;
    rot2 = 270;
  } else if (bottomRowRotation === 'outward') {
    rot1 = 270;
    rot2 = 90;
  }

  slots.push({
    index: 4,
    row: 'bottom',
    xMm: x1,
    yMm: bottomY,
    widthMm: bottomCardW,
    heightMm: bottomCardH,
    rotationDeg: rot1,
    targetCardWidthMm: cw,
    targetCardHeightMm: snapBottomToColumns ? bottomCardW : ch,
  });

  slots.push({
    index: 5,
    row: 'bottom',
    xMm: x2,
    yMm: bottomY,
    widthMm: bottomCardW,
    heightMm: bottomCardH,
    rotationDeg: rot2,
    targetCardWidthMm: cw,
    targetCardHeightMm: snapBottomToColumns ? bottomCardW : ch,
  });

  return slots;
}

/**
 * Calculates cut lines for cutting out the 6 cards.
 */
export function calculateCutLines(config: LayoutConfig): CutLine[] {
  const { cardWidthMm: cw, cardHeightMm: ch, snapBottomToColumns, includeInnerCutLines } = config;
  const topMargin = (A4_HEIGHT_MM - (ch + cw)) / 2;
  const leftMargin = (A4_WIDTH_MM - cw * 4) / 2;

  const lines: CutLine[] = [];

  // Horizontal lines across sheet (3 lines)
  // 1. Top border
  lines.push({ type: 'horizontal', posMm: topMargin });
  // 2. Middle horizontal dividing top and bottom rows
  lines.push({ type: 'horizontal', posMm: topMargin + ch });
  // 3. Bottom border
  lines.push({ type: 'horizontal', posMm: topMargin + ch + cw });

  // Vertical lines:
  // 1. Left border (col 1 left) -> full sheet
  lines.push({ type: 'vertical', posMm: leftMargin });

  // 2. Col 1-2 boundary -> ONLY for top row! (from top of sheet to middle horizontal divider)
  // NEVER cross into card #5!
  lines.push({
    type: 'vertical',
    posMm: leftMargin + cw,
    fromMm: 0,
    toMm: topMargin + ch,
  });

  // 3. Center line (Col 2-3 boundary & boundary between card #5 and #6) -> full sheet
  lines.push({ type: 'vertical', posMm: leftMargin + cw * 2 });

  // 4. Col 3-4 boundary -> ONLY for top row! (from top of sheet to middle horizontal divider)
  // NEVER cross into card #6!
  lines.push({
    type: 'vertical',
    posMm: leftMargin + cw * 3,
    fromMm: 0,
    toMm: topMargin + ch,
  });

  // 5. Right border (col 4 right) -> full sheet
  lines.push({ type: 'vertical', posMm: leftMargin + cw * 4 });

  // Optional inner cut lines for bottom row (only relevant if not snapped to columns)
  if (!snapBottomToColumns && includeInnerCutLines) {
    lines.push({
      type: 'vertical',
      posMm: leftMargin + ch,
      fromMm: topMargin + ch,
      toMm: topMargin + ch + cw,
      isSecondary: true,
    });
    lines.push({
      type: 'vertical',
      posMm: leftMargin + 4 * cw - ch,
      fromMm: topMargin + ch,
      toMm: topMargin + ch + cw,
      isSecondary: true,
    });
  }

  return lines;
}
