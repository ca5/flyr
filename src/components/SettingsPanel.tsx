import React from 'react';
import {
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Scissors,
  Sliders,
  Palette,
  LayoutGrid,
  Maximize2,
  Minimize2,
  StretchHorizontal,
  Sparkles,
  Ratio,
} from 'lucide-react';
import {
  LayoutConfig,
  CutLineStyle,
  CutLineColor,
  UploadedImageData,
} from '../types';
import { calculateOptimalCardDimensions } from '../constants/layout';

interface SettingsPanelProps {
  config: LayoutConfig;
  frontImage: UploadedImageData | null;
  onChange: (config: LayoutConfig) => void;
  onRotateImage: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  frontImage,
  onChange,
  onRotateImage,
  onFlipH,
  onFlipV,
}) => {
  const updateConfig = <K extends keyof LayoutConfig>(key: K, value: LayoutConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const applyPreset = (widthMm: number, heightMm: number, autoAspect: boolean = false) => {
    onChange({
      ...config,
      cardWidthMm: widthMm,
      cardHeightMm: heightMm,
      autoAspectFit: autoAspect,
    });
  };

  const handleAutoAspectToggle = (checked: boolean) => {
    if (checked && frontImage) {
      const optimal = calculateOptimalCardDimensions(frontImage.aspectRatio);
      onChange({
        ...config,
        autoAspectFit: true,
        cardWidthMm: optimal.cardWidthMm,
        cardHeightMm: optimal.cardHeightMm,
      });
    } else {
      updateConfig('autoAspectFit', checked);
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-6 shadow-lg shadow-black/20">
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
        <Sliders className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-slate-100 text-base">レイアウト・印刷設定</h3>
      </div>

      {/* 0. Card Dimensions & Aspect Ratio Optimization (Zero Gap Between Rows) */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-purple-950/60 to-slate-900 border border-indigo-500/40 rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sm text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>画像比率に自動最適化（余白ゼロ・一発カット）</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              画像の縦横比に合わせてカード寸法を自動調整。#1と#5の間（上段と下段の間）の白い余白を無くし、1本の水平カットで同時に切り離せます。
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={config.autoAspectFit}
              onChange={(e) => handleAutoAspectToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Aspect presets */}
        <div className="pt-2 border-t border-indigo-900/50">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <Ratio className="w-3.5 h-3.5 text-indigo-400" />
            カード比率プリセット:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {frontImage && (
              <button
                type="button"
                onClick={() => {
                  const optimal = calculateOptimalCardDimensions(frontImage.aspectRatio);
                  applyPreset(optimal.cardWidthMm, optimal.cardHeightMm, true);
                }}
                className={`p-2 rounded-lg text-xs font-medium border text-left cursor-pointer transition-all ${
                  config.autoAspectFit
                    ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>🤖 画像比率に自動</span>
                </div>
                <div className="text-[10px] text-indigo-300 mt-0.5">
                  {config.cardWidthMm} × {config.cardHeightMm} mm
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => applyPreset(70.25, 99.37, false)}
              className={`p-2 rounded-lg text-xs font-medium border text-left cursor-pointer transition-all ${
                !config.autoAspectFit && Math.abs(config.cardWidthMm - 70.25) < 1
                  ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold">📮 はがき/A4比率 (1:1.41)</div>
              <div className="text-[10px] text-slate-400 mt-0.5">70.3 × 99.4 mm</div>
            </button>

            <button
              type="button"
              onClick={() => applyPreset(67.5, 120.0, false)}
              className={`p-2 rounded-lg text-xs font-medium border text-left cursor-pointer transition-all ${
                !config.autoAspectFit && Math.abs(config.cardWidthMm - 67.5) < 1
                  ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold">📱 9:16 スマホ比率</div>
              <div className="text-[10px] text-slate-400 mt-0.5">67.5 × 120.0 mm</div>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-emerald-300 flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/40 rounded-lg px-2.5 py-1">
          ✓ 上段(#1〜#4)の底辺と下段(#5,#6)の天辺が1本の境界線に完全一致（1回で切断可能）
        </div>
      </div>

      {/* 1. Fit Mode */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
          画像のはめ込み方（フィットモード）
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => updateConfig('fitMode', 'cover')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              config.fitMode === 'cover'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-4 h-4 mb-1" />
            <span>全面切り抜き</span>
            <span className="text-[10px] text-slate-500 mt-0.5">余白なし (Cover)</span>
          </button>

          <button
            type="button"
            onClick={() => updateConfig('fitMode', 'contain')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              config.fitMode === 'contain'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Minimize2 className="w-4 h-4 mb-1" />
            <span>全体を収める</span>
            <span className="text-[10px] text-slate-500 mt-0.5">比率維持 (Contain)</span>
          </button>

          <button
            type="button"
            onClick={() => updateConfig('fitMode', 'fill')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              config.fitMode === 'fill'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <StretchHorizontal className="w-4 h-4 mb-1" />
            <span>引き伸ばし</span>
            <span className="text-[10px] text-slate-500 mt-0.5">比率無視 (Fill)</span>
          </button>
        </div>

        {config.fitMode === 'contain' && (
          <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" />
              余白の背景色:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateConfig('backgroundColor', '#ffffff')}
                className={`w-6 h-6 rounded-full border ${
                  config.backgroundColor === '#ffffff' ? 'ring-2 ring-indigo-500' : 'border-slate-600'
                } bg-white cursor-pointer`}
                title="白"
              />
              <button
                type="button"
                onClick={() => updateConfig('backgroundColor', '#000000')}
                className={`w-6 h-6 rounded-full border ${
                  config.backgroundColor === '#000000' ? 'ring-2 ring-indigo-500' : 'border-slate-600'
                } bg-black cursor-pointer`}
                title="黒"
              />
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                title="カスタムカラー"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Image Transformations */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
          画像の回転・反転
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRotateImage}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900/50 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            90°回転 {config.rotation > 0 && `(${config.rotation}°)`}
          </button>
          <button
            type="button"
            onClick={onFlipH}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              config.flipHorizontal
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                : 'bg-slate-900/50 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            左右反転
          </button>
          <button
            type="button"
            onClick={onFlipV}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              config.flipVertical
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                : 'bg-slate-900/50 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5" />
            上下反転
          </button>
        </div>
      </div>

      {/* 3. Bottom Row Orientation */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
          下段2枚の向き（90°回転方向）
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateConfig('bottomRowRotation', 'ccw')}
            className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
              config.bottomRowRotation === 'ccw'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="font-semibold text-slate-200">頭が左向き (標準)</div>
            <div className="text-[10px] text-slate-400 mt-0.5">サンプルPDFと同じ向き</div>
          </button>

          <button
            type="button"
            onClick={() => updateConfig('bottomRowRotation', 'cw')}
            className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
              config.bottomRowRotation === 'cw'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="font-semibold text-slate-200">頭が右向き</div>
            <div className="text-[10px] text-slate-400 mt-0.5">時計回りに90°倒す</div>
          </button>

          <button
            type="button"
            onClick={() => updateConfig('bottomRowRotation', 'inward')}
            className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
              config.bottomRowRotation === 'inward'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="font-semibold text-slate-200">内向き (対向)</div>
            <div className="text-[10px] text-slate-400 mt-0.5">両カードの頭が中央に向く</div>
          </button>

          <button
            type="button"
            onClick={() => updateConfig('bottomRowRotation', 'outward')}
            className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
              config.bottomRowRotation === 'outward'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="font-semibold text-slate-200">外向き (背中合わせ)</div>
            <div className="text-[10px] text-slate-400 mt-0.5">両カードの頭が外側に向く</div>
          </button>
        </div>
      </div>

      {/* 4. Cut Line Settings */}
      <div className="space-y-3 pt-2 border-t border-slate-700/60">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Scissors className="w-3.5 h-3.5 text-indigo-400" />
          カットライン（裁断線）
        </label>

        {/* Style */}
        <div className="grid grid-cols-3 gap-2">
          {(['solid', 'dashed', 'none'] as CutLineStyle[]).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => updateConfig('cutLineStyle', style)}
              className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                config.cutLineStyle === style
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {style === 'solid' && '実線 (標準)'}
              {style === 'dashed' && '破線 (ガイド用)'}
              {style === 'none' && '非表示 (フチなし)'}
            </button>
          ))}
        </div>

        {/* Color & Options */}
        {config.cutLineStyle !== 'none' && (
          <div className="space-y-3 bg-slate-900/40 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">線の色:</span>
              <div className="flex gap-2">
                {[
                  { id: 'darkGray', name: '濃いグレー', color: 'bg-slate-600' },
                  { id: 'gray', name: '薄いグレー', color: 'bg-slate-400' },
                  { id: 'black', name: '黒', color: 'bg-black border border-slate-600' },
                  { id: 'lightCyan', name: 'シアン', color: 'bg-cyan-400' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateConfig('cutLineColor', item.id as CutLineColor)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border cursor-pointer ${
                      config.cutLineColor === item.id
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                        : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card dimensions info */}
      <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3 text-xs text-indigo-300/90 space-y-1">
        <div className="font-semibold text-indigo-200 flex items-center justify-between">
          <span>仕上がり寸法</span>
          <span className="text-[11px] bg-indigo-500/20 px-1.5 py-0.5 rounded">
            {config.cardWidthMm} × {config.cardHeightMm} mm
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          上段4枚・下段2枚の境目がピッタリ重なるため、中央の水平カット1本で同時に切り離せます。
        </p>
      </div>
    </div>
  );
};
