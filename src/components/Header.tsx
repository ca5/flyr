import { Scissors, Sparkles, BookOpen, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onOpenGuide: () => void;
  onReset: () => void;
  hasImage: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onOpenGuide,
  onReset,
  hasImage,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Flyr 6面印刷
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                A4 → 6枚
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              A4用紙1枚に6枚のフライヤーを高画質配置・カット用PDF作成
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 rounded-lg transition-colors cursor-pointer"
            title="サンプルフライヤー画像を読み込みます"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="hidden xs:inline">サンプルで試す</span>
            <span className="xs:hidden">サンプル</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="カット手順・印刷のコツを見る"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">カット手順</span>
          </button>

          {hasImage && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="リセット"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
