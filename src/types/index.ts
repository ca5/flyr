export type FitMode = 'cover' | 'contain' | 'fill';

export type CutLineStyle = 'solid' | 'dashed' | 'none';
export type CutLineColor = 'gray' | 'darkGray' | 'black' | 'lightCyan';

export type BottomRowRotation = 'cw' | 'ccw' | 'inward' | 'outward'; // ccw = 270 deg (Sample PDF), cw = 90 deg
export type BottomRowAlign = 'outer' | 'center' | 'left' | 'right';

export interface LayoutConfig {
  // Card dimensions in mm
  cardWidthMm: number;    // default 67.5 mm
  cardHeightMm: number;   // default 120.0 mm

  // Auto match card dimensions to image aspect ratio (Zero padding between top & bottom!)
  autoAspectFit: boolean; // default true

  // Snap bottom row to top columns for easy cutting
  snapBottomToColumns: boolean; // default true

  // Fit & visual
  fitMode: FitMode;
  backgroundColor: string; // padding background if contain mode, e.g. '#ffffff' or '#000000'

  // Image transforms
  rotation: number; // 0, 90, 180, 270
  flipHorizontal: boolean;
  flipVertical: boolean;

  // Bottom row orientation
  bottomRowRotation: BottomRowRotation;
  bottomRowAlign: BottomRowAlign;

  // Cut lines
  cutLineStyle: CutLineStyle;
  cutLineColor: CutLineColor;
  cutLineWidthPt: number; // default 0.35 pt (approx 0.12mm)
  includeInnerCutLines: boolean;
  includeCenterFoldLine: boolean;

  // Bleed / Margins
  addBleedMarks: boolean;
}

export interface CardSlot {
  index: number; // 0..5
  row: 'top' | 'bottom';
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotationDeg: number; // relative to sheet
  targetCardWidthMm: number; // logical unrotated card width
  targetCardHeightMm: number; // logical unrotated card height
}

export interface CutLine {
  type: 'horizontal' | 'vertical';
  posMm: number;
  fromMm?: number;
  toMm?: number;
  isSecondary?: boolean;
}

export interface UploadedImageData {
  file?: File;
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  name: string;
}
