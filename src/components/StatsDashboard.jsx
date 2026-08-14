import React, { useState } from 'react';
import LottoBall from './LottoBall';
import { getBallColorInfo } from '../utils/ballColors';
import { Flame, Snowflake, BarChart3, Grid, Calendar, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function StatsDashboard({
  statsData,
  loading,
  roundCount,
  onRoundCountChange,
  onRefresh
}) {
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'heatmap' | 'history'

  if (loading && (!statsData || !statsData.frequencies)) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center backdrop-blur-sm">
        <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-300 font-bold">동행복권 최신 당첨 통계 데이터를 집계하는 중입니다...</p>
        <p className="text-slate-500 text-xs mt-1">최근 {roundCount}회차 당첨 데이터를 동기화하고 있습니다.</p>
      </div>
    );
  }

  const {
    latestRound = 0,
    totalRoundsAnalyzed = 30,
    frequencies = {},
    hotNumbers = [],
    coldNumbers = [],
    drawHistory = []
  } = statsData || {};

  // Prepare chart data for numbers 1 to 45
  const chartData = Array.from({ length: 45 }, (_, i) => {
    const num = i + 1;
    const count = frequencies[num] || 0;
    const info = getBallColorInfo(num);
    return {
      number: num,
      count: count,
      hex: info.hex,
      rangeName: info.name
    };
  });

  // Calculate max frequency for heatmap scaling
  const maxFreq = Math.max(...Object.values(frequencies), 1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-6">
      {/* Header & Round Count Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <span className="text-amber-400">📊</span> 당첨 통계 및 가중치 분석
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-800 border border-slate-700 text-amber-400">
              최근 {totalRoundsAnalyzed}회차 분석
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            출현 빈도수가 높은 번호일수록 추첨 가중치가 부여되어 선택될 확률이 증가합니다.
          </p>
        </div>

        {/* Round Filter Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">분석 범위:</span>
          {[20, 30, 50].map((count) => (
            <button
              key={count}
              onClick={() => onRoundCountChange(count)}
              disabled={loading}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${roundCount === count
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}
              `}
            >
              {count}회
            </button>
          ))}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors ml-1"
            title="통계 새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hot & Cold Numbers Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hot Numbers Card */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-950/80 to-slate-950 border border-amber-500/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-sm">HOT 번호 Top 5</h3>
                <p className="text-[11px] text-amber-300/80">최근 최다 출현 번호</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              가중치 최고
            </span>
          </div>

          <div className="flex items-center justify-around gap-2 pt-1">
            {hotNumbers.map((item) => (
              <div key={item.num} className="flex flex-col items-center gap-1">
                <LottoBall number={item.num} size="lg" badge="hot" />
                <span className="text-[11px] font-bold text-amber-300">{item.count}회 출현</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Numbers Card */}
        <div className="bg-gradient-to-br from-cyan-950/40 via-slate-950/80 to-slate-950 border border-cyan-500/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
                <Snowflake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-sm">COLD 번호 Top 5</h3>
                <p className="text-[11px] text-cyan-300/80">최근 최저 출현 번호</p>
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              가중치 낮은 편
            </span>
          </div>

          <div className="flex items-center justify-around gap-2 pt-1">
            {coldNumbers.map((item) => (
              <div key={item.num} className="flex flex-col items-center gap-1">
                <LottoBall number={item.num} size="lg" badge="cold" />
                <span className="text-[11px] font-bold text-cyan-300">{item.count}회 출현</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Toggle Tabs (Bar Chart / Heatmap / History) */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
              ${viewMode === 'chart'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            <BarChart3 className="w-4 h-4" />
            <span>빈도수 차트</span>
          </button>

          <button
            onClick={() => setViewMode('heatmap')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
              ${viewMode === 'heatmap'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            <Grid className="w-4 h-4" />
            <span>1~45 히트맵 Grid</span>
          </button>

          <button
            onClick={() => setViewMode('history')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
              ${viewMode === 'history'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            <Calendar className="w-4 h-4" />
            <span>당첨 이력 ({drawHistory.length})</span>
          </button>
        </div>

        {/* Color Legend */}
        <div className="hidden md:flex items-center gap-3 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FBC400]"></span> 1~10</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#69C8F2]"></span> 11~20</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF7272]"></span> 21~30</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#AAAAAA]"></span> 31~40</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#B0D840]"></span> 41~45</span>
        </div>
      </div>

      {/* Mode 1: Bar Chart */}
      {viewMode === 'chart' && (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="number" tick={{ fill: '#94A3B8', fontSize: 10 }} interval={1} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2">
                        <LottoBall number={data.number} size="sm" />
                        <div>
                          <p className="font-extrabold text-slate-100">{data.number}번</p>
                          <p className="text-amber-400 font-bold">{data.count}회 출현</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.hex} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mode 2: Heatmap */}
      {viewMode === 'heatmap' && (
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-2.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          {chartData.map((item) => {
            const ratio = maxFreq > 0 ? item.count / maxFreq : 0;
            return (
              <div
                key={item.number}
                className="relative flex flex-col items-center justify-center p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-amber-500/50 transition-all"
              >
                <LottoBall number={item.number} size="md" />
                <span className="text-xs font-black text-slate-200 mt-1.5">{item.count}회</span>
                
                {/* Heat intensity bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(ratio * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 3: Recent Draw History */}
      {viewMode === 'history' && (
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {drawHistory.map((draw) => (
            <div
              key={draw.drwNo}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="font-black text-amber-400 text-sm shrink-0">
                  {draw.drwNo}회차
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  ({draw.drwNoDate})
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {draw.numbers.map((num) => (
                    <LottoBall key={num} number={num} size="sm" />
                  ))}
                  <span className="text-slate-500 font-bold text-xs mx-1">+</span>
                  <LottoBall number={draw.bonusNo} size="sm" badge="bonus" />
                </div>
              </div>

              {draw.firstWinamnt && (
                <div className="text-right text-xs text-slate-400 shrink-0">
                  <span className="font-bold text-slate-200">1등 당첨금: </span>
                  <span className="text-emerald-400 font-bold">
                    {(draw.firstWinamnt / 100000000).toFixed(1)}억원
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1">({draw.firstPrzwnerCo}명)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
