import React from 'react';
import { getBallColorInfo } from '../utils/ballColors';

export default function LottoBall({
  number,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  badge = null, // 'fixed', 'excluded', 'hot', 'cold' or string
  animated = false,
  dimmed = false,
  className = '',
  onClick = null
}) {
  const colorInfo = getBallColorInfo(number);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs font-bold',
    md: 'w-10 h-10 text-sm font-extrabold',
    lg: 'w-12 h-12 text-base font-black',
    xl: 'w-14 h-14 text-lg font-black',
  };

  const badgeConfig = {
    fixed: { text: '고정', bg: 'bg-emerald-500 text-white' },
    excluded: { text: '제외', bg: 'bg-rose-500 text-white' },
    hot: { text: 'HOT', bg: 'bg-amber-500 text-slate-900 font-black' },
    cold: { text: 'COLD', bg: 'bg-cyan-600 text-white font-bold' },
  };

  const badgeObj = typeof badge === 'string' && badgeConfig[badge] ? badgeConfig[badge] : null;

  return (
    <div className="relative inline-flex items-center justify-center select-none group">
      <div
        onClick={onClick}
        className={`
          relative flex items-center justify-center rounded-full transition-all duration-300
          ${sizeClasses[size] || sizeClasses.md}
          ${colorInfo.className}
          ${animated ? 'animate-pop-in' : ''}
          ${dimmed ? 'opacity-30 grayscale filter' : 'hover:scale-110 cursor-pointer'}
          ${onClick ? 'active:scale-95' : ''}
          ${className}
        `}
      >
        {/* Subtle shine reflective curve */}
        <div className="absolute top-1 left-2 w-2.5 h-1.5 bg-white/40 rounded-full blur-[0.5px] pointer-events-none" />
        <span className="z-10 leading-none drop-shadow-sm">{number}</span>
      </div>

      {badgeObj && (
        <span
          className={`
            absolute -top-1.5 -right-1 px-1 py-0.5 rounded-full text-[9px] leading-none shadow-sm z-20 pointer-events-none
            ${badgeObj.bg}
          `}
        >
          {badgeObj.text}
        </span>
      )}
    </div>
  );
}
