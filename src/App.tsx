import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { SettingsPanel } from './components/SettingsPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ActionToolbar } from './components/ActionToolbar';
import { CuttingGuideModal } from './components/CuttingGuideModal';
import { DEFAULT_LAYOUT_CONFIG, calculateOptimalCardDimensions } from './constants/layout';
import { LayoutConfig, UploadedImageData } from './types';

export const App: React.FC = () => {
  const [frontImage, setFrontImage] = useState<UploadedImageData | null>(null);
  const [backImage, setBackImage] = useState<UploadedImageData | null>(null);
  const [config, setConfig] = useState<LayoutConfig>(DEFAULT_LAYOUT_CONFIG);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Load sample image (8bit-lounge / IMG_8313.PNG)
  const loadSample = async () => {
    try {
      const response = await fetch('/8bit-lounge.png');
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const img = new Image();
      img.onload = () => {
        const aspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
        const imgData: UploadedImageData = {
          dataUrl,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          aspectRatio: aspect,
          name: 'IMG_8313.PNG (8bit-lounge)',
        };

        // Automatically optimize card dimensions to image aspect ratio
        const optimal = calculateOptimalCardDimensions(aspect);
        setConfig((prev) => ({
          ...prev,
          cardWidthMm: optimal.cardWidthMm,
          cardHeightMm: optimal.cardHeightMm,
        }));

        setFrontImage(imgData);
      };
      img.src = dataUrl;
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  };

  // Auto-load sample image on mount
  useEffect(() => {
    loadSample();
  }, []);

  // When a new front image is uploaded, auto-calculate optimal dimensions if autoAspectFit is on
  const handleFrontImageChange = (data: UploadedImageData | null) => {
    setFrontImage(data);
    if (data && config.autoAspectFit) {
      const optimal = calculateOptimalCardDimensions(data.aspectRatio);
      setConfig((prev) => ({
        ...prev,
        cardWidthMm: optimal.cardWidthMm,
        cardHeightMm: optimal.cardHeightMm,
      }));
    }
  };

  const handleRotateImage = () => {
    setConfig((prev) => {
      const newRotation = (prev.rotation + 90) % 360;
      let newW = prev.cardWidthMm;
      let newH = prev.cardHeightMm;
      if (frontImage && prev.autoAspectFit) {
        // Invert aspect ratio for 90/270 degree rotation
        const effectiveAspect = newRotation % 180 !== 0 ? 1 / frontImage.aspectRatio : frontImage.aspectRatio;
        const optimal = calculateOptimalCardDimensions(effectiveAspect);
        newW = optimal.cardWidthMm;
        newH = optimal.cardHeightMm;
      }
      return {
        ...prev,
        rotation: newRotation,
        cardWidthMm: newW,
        cardHeightMm: newH,
      };
    });
  };

  const handleFlipH = () => {
    setConfig((prev) => ({
      ...prev,
      flipHorizontal: !prev.flipHorizontal,
    }));
  };

  const handleFlipV = () => {
    setConfig((prev) => ({
      ...prev,
      flipVertical: !prev.flipVertical,
    }));
  };

  const handleReset = () => {
    setFrontImage(null);
    setBackImage(null);
    setConfig(DEFAULT_LAYOUT_CONFIG);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Header
        onLoadSample={loadSample}
        onOpenGuide={() => setIsGuideOpen(true)}
        onReset={handleReset}
        hasImage={!!frontImage}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Upload & Settings (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <ImageUploader
              frontImage={frontImage}
              backImage={backImage}
              onFrontImageChange={handleFrontImageChange}
              onBackImageChange={setBackImage}
              onLoadSample={loadSample}
            />

            <SettingsPanel
              config={config}
              frontImage={frontImage}
              onChange={setConfig}
              onRotateImage={handleRotateImage}
              onFlipH={handleFlipH}
              onFlipV={handleFlipV}
            />
          </div>

          {/* Right Column: Interactive Preview & Action Toolbar (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-20">
            <PreviewCanvas
              frontImage={frontImage}
              backImage={backImage}
              config={config}
            />

            <ActionToolbar
              frontImage={frontImage}
              backImage={backImage}
              config={config}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
          <p>Flyr - A4 6面フライヤー印刷用PDF作成ツール</p>
          <p className="text-slate-600 text-[11px]">
            画像比率に自動フィットして余白ゼロ化 | A4用紙: 297mm × 210mm (横向き)
          </p>
        </div>
      </footer>

      {/* Cutting Guide Modal */}
      <CuttingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
