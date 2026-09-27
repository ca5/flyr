import React, { useState } from 'react';
import { Download, Printer, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateFlyerPDF } from '../utils/pdfGenerator';
import { LayoutConfig, UploadedImageData } from '../types';

interface ActionToolbarProps {
  frontImage: UploadedImageData | null;
  backImage: UploadedImageData | null;
  config: LayoutConfig;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  frontImage,
  backImage,
  config,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPDF = async () => {
    if (!frontImage) return;

    try {
      setIsGenerating(true);
      setDownloadSuccess(false);

      const pdfBytes = await generateFlyerPDF(frontImage, backImage, config);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const baseName = frontImage.name ? frontImage.name.replace(/\.[^/.]+$/, '') : 'flyer';
      a.download = `${baseName}_A4_6面印刷用.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('PDFの生成中にエラーが発生しました。別の画像形式をお試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!frontImage) return;

    try {
      setIsGenerating(true);
      const pdfBytes = await generateFlyerPDF(frontImage, backImage, config);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Open print window with PDF
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      } else {
        // Fallback for popup blocker
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        iframe.onload = () => {
          iframe.contentWindow?.print();
        };
      }
    } catch (err) {
      console.error('Failed to print PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = !frontImage || isGenerating;

  return (
    <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownloadPDF}
          disabled={isDisabled}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all cursor-pointer ${
            isDisabled
              ? 'bg-slate-700/50 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>PDFを高品質生成中...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>PDFをダウンロードしました！</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>PDFをダウンロード（A4・6面）</span>
            </>
          )}
        </button>

        <button
          onClick={handlePrint}
          disabled={isDisabled}
          className={`flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm border transition-all cursor-pointer ${
            isDisabled
              ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
              : 'bg-slate-700/80 hover:bg-slate-600 border-slate-600 text-slate-100 hover:text-white'
          }`}
          title="ブラウザから直接印刷"
        >
          <Printer className="w-4 h-4" />
          <span>直接印刷</span>
        </button>
      </div>

      {/* Printing Tips banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-xs text-slate-300">
        <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-200">
            自宅やコンビニ等のプリンターで印刷する際のコツ:
          </p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            印刷設定の「倍率」を <strong className="text-indigo-300">100%（実際のサイズ / 拡大縮小なし）</strong> に設定し、用紙方向を <strong className="text-indigo-300">横向き（Landscape）</strong> にしてください。「用紙に合わせる」にすると数mmずれる場合があります。
          </p>
        </div>
      </div>
    </div>
  );
};
