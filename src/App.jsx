import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import LottoBall from './components/LottoBall';
import NumberSelector from './components/NumberSelector';
import LottoTicket from './components/LottoTicket';
import StatsDashboard from './components/StatsDashboard';
import { generateLottoGames } from './utils/lottoGenerator';
import { Sparkles, Dices, BarChart3, HelpCircle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'stats' | 'guide'
  const [roundCount, setRoundCount] = useState(30);
  const [statsData, setStatsData] = useState(null);
  const [latestDraw, setLatestDraw] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // User Filter Selection
  const [fixedNumbers, setFixedNumbers] = useState([]);
  const [excludedNumbers, setExcludedNumbers] = useState([]);

  // Generated 5 games
  const [games, setGames] = useState([]);

  // Fetch Stats from Backend Proxy
  const fetchStats = useCallback(async (count = roundCount) => {
    setLoadingStats(true);
    try {
      const response = await axios.get(`/api/lotto/stats?count=${count}`);
      if (response.data && response.data.success) {
        setStatsData(response.data.data);
        if (response.data.data.drawHistory && response.data.data.drawHistory.length > 0) {
          setLatestDraw(response.data.data.drawHistory[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch real stats, loading mock data fallback:', err.message);
      try {
        const mockResp = await axios.get('/api/lotto/mock-stats');
        if (mockResp.data && mockResp.data.success) {
          setStatsData(mockResp.data.data);
        }
      } catch (mockErr) {
        console.error('Failed mock stats as well:', mockErr);
      }
    } finally {
      setLoadingStats(false);
    }
  }, [roundCount]);

  useEffect(() => {
    fetchStats(roundCount);
  }, [roundCount, fetchStats]);

  // Generate 5 Games using Weighted Random Sampling
  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const frequencies = statsData?.frequencies || {};
      const bonusFrequencies = statsData?.bonusFrequencies || {};
      const newGames = generateLottoGames({
        frequencies,
        bonusFrequencies,
        fixedNumbers,
        excludedNumbers,
        baseWeight: 1,
        numGames: 5
      });
      setGames(newGames);
      setIsGenerating(false);
    }, 200);
  }, [statsData, fixedNumbers, excludedNumbers]);

  // Initial Auto Generate on load after stats ready
  useEffect(() => {
    if (statsData && games.length === 0) {
      handleGenerate();
    }
  }, [statsData, games.length, handleGenerate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              🎰
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
                로또 6/45 통계 기반 자동 생성기
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  AI Weighted + Bonus
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                동행복권 과거 당첨 데이터 빈도 분석 기반 가중치 추첨 알고리즘 (6개 본 번호 + 1개 보너스 번호)
              </p>
            </div>
          </div>

          {/* Latest Round Display Header */}
          {latestDraw && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-1.5 flex items-center gap-2 text-xs">
              <span className="font-extrabold text-amber-400 shrink-0">
                {latestDraw.drwNo}회 당첨:
              </span>
              <div className="flex items-center gap-1">
                {latestDraw.numbers.map(n => (
                  <LottoBall key={n} number={n} size="sm" />
                ))}
                <span className="text-slate-500 font-bold px-0.5">+</span>
                <LottoBall number={latestDraw.bonusNo} size="sm" badge="bonus" />
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-1 border-t border-slate-800/80 pt-2 pb-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('generator')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap
                ${activeTab === 'generator'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}
              `}
            >
              <Dices className="w-4 h-4" />
              <span>5게임 자동 생성기 (+보너스)</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap
                ${activeTab === 'stats'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}
              `}
            >
              <BarChart3 className="w-4 h-4" />
              <span>당첨 통계 & 히트맵</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap
                ${activeTab === 'guide'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}
              `}
            >
              <HelpCircle className="w-4 h-4" />
              <span>알고리즘 가이드</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Number Selector Filter */}
            <div className="lg:col-span-6 space-y-6">
              <NumberSelector
                fixedNumbers={fixedNumbers}
                setFixedNumbers={setFixedNumbers}
                excludedNumbers={excludedNumbers}
                setExcludedNumbers={setExcludedNumbers}
              />
            </div>

            {/* Right Column: Lotto 5 Game Ticket */}
            <div className="lg:col-span-6 space-y-6">
              <LottoTicket
                games={games}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                fixedNumbers={fixedNumbers}
                analyzedRounds={statsData?.totalRoundsAnalyzed || 30}
              />
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <StatsDashboard
            statsData={statsData}
            loading={loadingStats}
            roundCount={roundCount}
            onRoundCountChange={setRoundCount}
            onRefresh={() => fetchStats(roundCount)}
          />
        )}

        {activeTab === 'guide' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                통계 기반 가중치 추첨(Weighted Random Sampling) 알고리즘 상세 설명
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                완전 무작위 난수 생성이 아닌, 과거 당첨 확률 데이터를 과학적으로 반영하는 로또 추출 방식입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Zap className="w-4 h-4" /> 1. 가중치 계산 식
                </div>
                <p className="text-xs text-slate-300">
                  <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">Weight(n) = Count(n) + Base Weight</code>
                </p>
                <p className="text-xs text-slate-400">
                  최근 N회차 출현 빈도수 <code className="text-slate-300">Count(n)</code>에 기본 가중치(1)를 더하여 모든 번호가 최소한의 추첨 기회를 가집니다.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> 2. 고정 / 제외 번호 적용
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  • 고정 번호 (최대 5개): 무조건 게임에 포함
                </p>
                <p className="text-xs text-slate-300 font-medium">
                  • 제외 번호 (최대 10개): 후보 리스트에서 100% 제거
                </p>
                <p className="text-xs text-slate-400">
                  나머지 남은 자리만 가중치 기반 무복원 추출을 진행합니다.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" /> 3. 6개 본 번호 + 1개 보너스 추첨
                </div>
                <p className="text-xs text-slate-400">
                  각 게임(A~E)마다 중복 없는 6개 본 번호(오름차순 정렬)와 1개 보너스 번호를 무복원 무작위 추첨합니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 로또 6/45 통계 기반 자동 번호 생성기. All rights reserved.</p>
          <p className="text-slate-600">데이터 출처: 동행복권 (dhlottery.co.kr) API</p>
        </div>
      </footer>
    </div>
  );
}
