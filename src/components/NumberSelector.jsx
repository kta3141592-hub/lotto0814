import React, { useState } from 'react';
import LottoBall from './LottoBall';
import { Lock, Ban, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NumberSelector({
  fixedNumbers,
  setFixedNumbers,
  excludedNumbers,
  setExcludedNumbers
}) {
  const [activeTab, setActiveTab] = useState('fixed'); // 'fixed' | 'excluded'
  const [warningMsg, setWarningMsg] = useState('');

  const showWarning = (msg) => {
    setWarningMsg(msg);
    setTimeout(() => setWarningMsg(''), 3000);
  };

  const handleBallClick = (num) => {
    setWarningMsg('');
    const n = Number(num);

    if (activeTab === 'fixed') {
      // Toggle Fixed Number
      if (fixedNumbers.includes(n)) {
        setFixedNumbers(fixedNumbers.filter(x => x !== n));
      } else {
        if (excludedNumbers.includes(n)) {
          showWarning(`${n}번은 이미 제외 번호로 지정되어 있어 고정 번호로 추가할 수 없습니다.`);
          return;
        }
        if (fixedNumbers.length >= 5) {
          showWarning('고정 번호는 최대 5개까지 설정할 수 있습니다.');
          return;
        }
        setFixedNumbers([...fixedNumbers, n].sort((a, b) => a - b));
      }
    } else {
      // Toggle Excluded Number
      if (excludedNumbers.includes(n)) {
        setExcludedNumbers(excludedNumbers.filter(x => x !== n));
      } else {
        if (fixedNumbers.includes(n)) {
          showWarning(`${n}번은 이미 고정 번호로 지정되어 있어 제외 번호로 추가할 수 없습니다.`);
          return;
        }
        if (excludedNumbers.length >= 10) {
          showWarning('제외 번호는 최대 10개까지 설정할 수 있습니다.');
          return;
        }
        setExcludedNumbers([...excludedNumbers, n].sort((a, b) => a - b));
      }
    }
  };

  const removeFixed = (num) => {
    setFixedNumbers(fixedNumbers.filter(n => n !== num));
  };

  const removeExcluded = (num) => {
    setExcludedNumbers(excludedNumbers.filter(n => n !== num));
  };

  const clearAll = () => {
    setFixedNumbers([]);
    setExcludedNumbers([]);
    setWarningMsg('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-amber-400">⚙️</span> 고정 / 제외 번호 필터
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            원하는 번호를 필수 포함하거나 추첨에서 완전히 배제하세요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
            title="모든 고정/제외 선택 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        </div>
      </div>

      {/* Mode Selector Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setActiveTab('fixed')}
          className={`
            flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all
            ${activeTab === 'fixed'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'}
          `}
        >
          <Lock className="w-4 h-4" />
          <span>고정 번호 지정</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'fixed' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
            {fixedNumbers.length} / 5
          </span>
        </button>

        <button
          onClick={() => setActiveTab('excluded')}
          className={`
            flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all
            ${activeTab === 'excluded'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-lg shadow-rose-500/10'
              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'}
          `}
        >
          <Ban className="w-4 h-4" />
          <span>제외 번호 지정</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'excluded' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {excludedNumbers.length} / 10
          </span>
        </button>
      </div>

      {/* Warning Message Toast */}
      {warningMsg && (
        <div className="mb-4 p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{warningMsg}</span>
        </div>
      )}

      {/* Active Selections Badges Summary */}
      <div className="mb-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <div className="flex flex-col gap-2 text-xs">
          {/* Fixed List */}
          <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
            <span className="font-semibold text-emerald-400 shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 고정 ({fixedNumbers.length}):
            </span>
            {fixedNumbers.length === 0 ? (
              <span className="text-slate-500 italic">선택 없음 (최대 5개)</span>
            ) : (
              fixedNumbers.map(num => (
                <span
                  key={`fixed-${num}`}
                  onClick={() => removeFixed(num)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950 border border-emerald-700/60 text-emerald-300 rounded-md cursor-pointer hover:bg-emerald-900 transition-colors"
                >
                  <LottoBall number={num} size="sm" />
                  <span className="font-bold">{num}</span>
                  <span className="text-emerald-500 hover:text-emerald-200 ml-1 text-xs">✕</span>
                </span>
              ))
            )}
          </div>

          {/* Excluded List */}
          <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
            <span className="font-semibold text-rose-400 shrink-0 flex items-center gap-1">
              <Ban className="w-3.5 h-3.5" /> 제외 ({excludedNumbers.length}):
            </span>
            {excludedNumbers.length === 0 ? (
              <span className="text-slate-500 italic">선택 없음 (최대 10개)</span>
            ) : (
              excludedNumbers.map(num => (
                <span
                  key={`ex-${num}`}
                  onClick={() => removeExcluded(num)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-950 border border-rose-700/60 text-rose-300 rounded-md cursor-pointer hover:bg-rose-900 transition-colors"
                >
                  <LottoBall number={num} size="sm" />
                  <span className="font-bold line-through">{num}</span>
                  <span className="text-rose-500 hover:text-rose-200 ml-1 text-xs">✕</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 1 ~ 45 Balls Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 justify-items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
        {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
          const isFixed = fixedNumbers.includes(num);
          const isExcluded = excludedNumbers.includes(num);
          
          let badgeState = null;
          if (isFixed) badgeState = 'fixed';
          if (isExcluded) badgeState = 'excluded';

          return (
            <div
              key={num}
              className={`
                relative p-1 rounded-xl transition-all duration-200 flex flex-col items-center justify-center cursor-pointer
                ${isFixed ? 'ring-2 ring-emerald-400 bg-emerald-500/10 scale-105' : ''}
                ${isExcluded ? 'ring-2 ring-rose-500/60 bg-rose-500/10 opacity-50' : ''}
                ${!isFixed && !isExcluded ? 'hover:bg-slate-800/80 hover:scale-105' : ''}
              `}
              onClick={() => handleBallClick(num)}
            >
              <LottoBall
                number={num}
                size="md"
                badge={badgeState}
                dimmed={isExcluded}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
