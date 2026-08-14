import React, { useState } from 'react';
import LottoBall from './LottoBall';
import { Copy, Check, Sparkles, RefreshCw, BookmarkPlus } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LottoTicket({
  games,
  onGenerate,
  isGenerating,
  fixedNumbers = [],
  analyzedRounds = 30
}) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSingleIndex, setCopiedSingleIndex] = useState(null);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // ignore
    }
  };

  const handleGenerateClick = () => {
    onGenerate();
    triggerConfetti();
  };

  const formatNumbersText = (numbers) => {
    return numbers.map(n => String(n).padStart(2, '0')).join(', ');
  };

  const copySingleGame = (game, index) => {
    let text = `[로또 6/45] 게임 ${game.label} : ${formatNumbersText(game.numbers)}`;
    if (game.bonusNumber) {
      text += ` + 보너스 ${String(game.bonusNumber).padStart(2, '0')}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedSingleIndex(index);
    setTimeout(() => setCopiedSingleIndex(null), 2000);
  };

  const copyAllGames = () => {
    if (!games || games.length === 0) return;
    
    let text = `[로또 6/45 통계 기반 (최근 ${analyzedRounds}회차 가중치) 5게임 + 보너스 추천 조합]\n`;
    games.forEach((g) => {
      text += `게임 ${g.label} : ${formatNumbersText(g.numbers)}`;
      if (g.bonusNumber) {
        text += ` + 보너스 ${String(g.bonusNumber).padStart(2, '0')}`;
      }
      text += '\n';
    });
    text += `\n* 생성 일시: ${new Date().toLocaleString('ko-KR')}`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between">
      {/* Ticket Header */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-extrabold rounded-md uppercase tracking-wider">
                Weighted Random Sampling
              </span>
              <span className="text-xs text-slate-400">
                (최근 {analyzedRounds}회 통계 반영)
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-1 flex items-center gap-2">
              🎫 5게임 자동 번호 조합
            </h2>
          </div>

          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-lg transition-all transform active:scale-95
              ${isGenerating
                ? 'bg-amber-600/50 text-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5'}
            `}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? '추첨 중...' : '가중치 5게임 추첨'}</span>
          </button>
        </div>

        {/* Empty State */}
        {(!games || games.length === 0) && (
          <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/40 my-4">
            <Sparkles className="w-12 h-12 text-amber-400/60 mx-auto mb-3 animate-pulse" />
            <p className="text-slate-300 font-bold text-base">가중치 5게임 추첨 버튼을 눌러주세요</p>
            <p className="text-slate-500 text-xs mt-1">과거 당첨 빈도수 통계 알고리즘이 적용된 조합을 생성합니다.</p>
          </div>
        )}

        {/* Games List (Always Visible Copy Button on Right) */}
        {games && games.length > 0 && (
          <div className="space-y-3 my-4">
            {games.map((game, idx) => (
              <div
                key={game.label}
                className="group relative flex items-center justify-between gap-3 p-3 bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 rounded-xl transition-all hover:bg-slate-950"
              >
                {/* Left side: Scrollable Balls Area */}
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-x-auto py-1 scrollbar-none">
                  {/* Game Label */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-xs sm:text-sm shadow-inner shrink-0 mr-0.5 sm:mr-1">
                    {game.label}
                  </div>

                  {/* 6 Main Lotto Balls */}
                  {game.numbers.map((num) => {
                    const isFixed = fixedNumbers.includes(num);
                    return (
                      <LottoBall
                        key={num}
                        number={num}
                        size="md"
                        badge={isFixed ? 'fixed' : null}
                        animated={true}
                      />
                    );
                  })}

                  {/* Plus Sign & Bonus Ball */}
                  {game.bonusNumber && (
                    <>
                      <span className="text-amber-400 font-black text-sm sm:text-base px-0.5 sm:px-1 shrink-0 select-none">
                        +
                      </span>
                      <LottoBall
                        number={game.bonusNumber}
                        size="md"
                        badge="bonus"
                        animated={true}
                      />
                    </>
                  )}
                </div>

                {/* Right side: Fixed Copy Button (Never hidden/clipped) */}
                <button
                  onClick={() => copySingleGame(game, idx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors shrink-0 ml-1 shadow-sm"
                  title="이 게임 조합 복사"
                >
                  {copiedSingleIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>복사</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Footer & Copy All Button */}
      {games && games.length > 0 && (
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <BookmarkPlus className="w-4 h-4 text-emerald-400" />
            <span>6개 본 번호 + 1개 보너스 번호 배정이 완료되었습니다.</span>
          </div>

          <button
            onClick={copyAllGames}
            className={`
              w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg
              ${copiedAll
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600'}
            `}
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>5게임 전체 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>전체 5게임 (+보너스) 클립보드 복사</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
