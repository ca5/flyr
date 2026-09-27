import React, { useRef, useState, useEffect } from 'react';
import { Upload, Trash2, Layers, CheckCircle2, FileImage } from 'lucide-react';
import { UploadedImageData } from '../types';

interface ImageUploaderProps {
  frontImage: UploadedImageData | null;
  backImage: UploadedImageData | null;
  onFrontImageChange: (data: UploadedImageData | null) => void;
  onBackImageChange: (data: UploadedImageData | null) => void;
  onLoadSample: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  frontImage,
  backImage,
  onFrontImageChange,
  onBackImageChange,
  onLoadSample,
}) => {
  const [isDraggingFront, setIsDraggingFront] = useState(false);
  const [isDraggingBack, setIsDraggingBack] = useState(false);
  const [showBackUploader, setShowBackUploader] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler for clipboard images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file, (data) => {
              if (!frontImage) {
                onFrontImageChange(data);
              } else if (showBackUploader && !backImage) {
                onBackImageChange(data);
              } else {
                onFrontImageChange(data);
              }
            });
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [frontImage, backImage, showBackUploader]);

  const processFile = (file: File, callback: (data: UploadedImageData) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        callback({
          file,
          dataUrl,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          aspectRatio: (img.naturalWidth || img.width) / (img.naturalHeight || img.height),
          name: file.name,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFrontDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFront(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file, onFrontImageChange);
    }
  };

  const handleBackDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingBack(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file, onBackImageChange);
    }
  };

  return (
    <div className="space-y-4">
      {/* Front Image Uploader */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
              1
            </span>
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
              フライヤー画像（表面）
            </h3>
          </div>
          {frontImage && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              読み込み完了
            </span>
          )}
        </div>

        {frontImage ? (
          <div className="relative group bg-slate-900/80 rounded-xl p-3 border border-slate-700/50 flex items-center gap-4">
            <div className="w-16 h-24 sm:w-20 sm:h-28 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800 shrink-0">
              <img
                src={frontImage.dataUrl}
                alt="Front preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium text-slate-200 truncate" title={frontImage.name}>
                {frontImage.name}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                  {frontImage.width} × {frontImage.height} px
                </span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                  比率: {(frontImage.aspectRatio).toFixed(3)} (
                  {Math.abs(frontImage.aspectRatio - 9 / 16) < 0.05
                    ? '約 9:16'
                    : Math.abs(frontImage.aspectRatio - 100 / 148) < 0.05
                    ? '約 はがき比率'
                    : 'カスタム'}
                  )
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ※画像を変更したい場合は下のボタンを押すか新しい画像をドロップ
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => frontInputRef.current?.click()}
                className="p-2 text-xs text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer"
                title="画像を変更"
              >
                変更
              </button>
              <button
                onClick={() => onFrontImageChange(null)}
                className="p-2 text-xs text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFront(true);
            }}
            onDragLeave={() => setIsDraggingFront(false)}
            onDrop={handleFrontDrop}
            onClick={() => frontInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
              isDraggingFront
                ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                : 'border-slate-600 hover:border-indigo-400/70 hover:bg-slate-800/50 bg-slate-900/40'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  クリックしてフライヤー画像を選択、またはドラッグ＆ドロップ
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG, WebP, SVG 対応 / クリップボード貼り付け (Cmd+V) も可能
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoadSample();
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-4 decoration-purple-500/50 hover:decoration-purple-400 transition-colors"
                >
                  またはサンプルフライヤーを読み込む
                </button>
              </div>
            </div>
          </div>
        )}
        <input
          ref={frontInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file, onFrontImageChange);
            e.target.value = '';
          }}
        />
      </div>

      {/* Double Sided Toggle & Back Image Uploader */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-slate-300 text-xs font-bold">
              2
            </span>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
                両面印刷（裏面用画像）
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              const next = !showBackUploader;
              setShowBackUploader(next);
              if (!next) {
                onBackImageChange(null);
              }
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              showBackUploader
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/50'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
            }`}
          >
            {showBackUploader ? '両面印刷: 有効' : '裏面を追加する'}
          </button>
        </div>

        {showBackUploader && (
          <div className="mt-4 pt-4 border-t border-slate-700/60">
            {backImage ? (
              <div className="relative group bg-slate-900/80 rounded-xl p-3 border border-slate-700/50 flex items-center gap-4">
                <div className="w-16 h-24 sm:w-20 sm:h-28 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800 shrink-0">
                  <img
                    src={backImage.dataUrl}
                    alt="Back preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium text-slate-200 truncate" title={backImage.name}>
                    {backImage.name}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                      {backImage.width} × {backImage.height} px
                    </span>
                    <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded text-[11px] border border-purple-700/40">
                      裏面（自動で左右反転・位置合わせ）
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => backInputRef.current?.click()}
                    className="p-2 text-xs text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer"
                  >
                    変更
                  </button>
                  <button
                    onClick={() => onBackImageChange(null)}
                    className="p-2 text-xs text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingBack(true);
                }}
                onDragLeave={() => setIsDraggingBack(false)}
                onDrop={handleBackDrop}
                onClick={() => backInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
                  isDraggingBack
                    ? 'border-purple-400 bg-purple-500/10 scale-[1.01]'
                    : 'border-slate-700 hover:border-purple-400/70 hover:bg-slate-800/40 bg-slate-900/30'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FileImage className="w-8 h-8 text-purple-400/70" />
                  <p className="text-xs font-medium text-slate-300">
                    裏面用フライヤー画像をアップロード
                  </p>
                  <p className="text-[11px] text-slate-500">
                    両面印刷時に裏表の位置がピッタリ一致するように自動で2ページ目を作成します
                  </p>
                </div>
              </div>
            )}
            <input
              ref={backInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file, onBackImageChange);
                e.target.value = '';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
