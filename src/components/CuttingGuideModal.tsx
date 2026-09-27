import { X, Scissors, Lightbulb } from 'lucide-react';

interface CuttingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CuttingGuideModal: React.FC<CuttingGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">フライヤーの裁断（カット）手順</h2>
            <p className="text-xs text-slate-400">
              定規とカッターナイフを使って、最も手早く綺麗に6枚を切り分ける方法
            </p>
          </div>
        </div>

        {/* Visual Steps */}
        <div className="space-y-4 text-slate-200 text-sm">
          {/* Step 1 */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-white">上下・左右の外周余白をカット</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                用紙の端から端まで引かれている一番外側の4本の直線（上辺・下辺・左辺・右辺）に定規を合わせ、カッターでスーッと一直線に切り落とします。
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-white">上段と下段を分ける真ん中の水平ラインをカット</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                上段（4枚の縦フライヤー）と下段（2枚の横フライヤー）の境目の水平線を切断します。これで上パーツと下パーツに分かれます。
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-white">上段の4枚を縦ラインで切り離す</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                上パーツにある3本の縦線に沿って切断すると、縦向きフライヤー4枚が完成します。
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs shrink-0">
              4
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-white">下段の2枚を切り離す</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                下パーツの中央（余白部分）をカットして切り落とすと、残りの横向きフライヤー2枚が完成します！（合計6枚）
              </p>
            </div>
          </div>

          {/* Tips box */}
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 text-xs text-amber-200/90 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Lightbulb className="w-4 h-4" />
              綺麗に切るためのプロのコツ
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 leading-relaxed">
              <li>カッターの刃を新しく折っておくと、断面が毛羽立たず綺麗に仕上がります。</li>
              <li>透明なアクリル定規または金属エッジ付き定規を使うと線が見えやすく安全です。</li>
              <li>厚紙（0.15mm〜0.22mm程度）やマットコート紙に印刷すると、本格的なフライヤーの質感になります。</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
