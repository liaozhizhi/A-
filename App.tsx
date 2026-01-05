import React, { useState, useEffect } from 'react';
import { LayoutDashboard, History, PlusCircle, TrendingUp } from './components/Icons';
import StockCard from './components/StockCard';
import MarketOverview from './components/MarketOverview';
import { DailyReview, Tab } from './types';
import { generateMarketAnalysis } from './geminiService';
import { saveReview, fetchLatestReview } from './supabaseService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TODAY);
  const [currentReview, setCurrentReview] = useState<DailyReview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [showInputModal, setShowInputModal] = useState<boolean>(false);

  useEffect(() => {
    loadLatestData();
  }, []);

  const loadLatestData = async () => {
    setLoading(true);
    const data = await fetchLatestReview();
    if (data) {
      setCurrentReview(data);
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!userInput.trim() && !confirm("未输入笔记，是否让AI根据全网知识模拟复盘？")) {
      return;
    }

    setLoading(true);
    setShowInputModal(false);
    
    // 1. Generate via Gemini
    const result = await generateMarketAnalysis(userInput);
    
    if (result) {
      // 2. Save to Supabase
      const saved = await saveReview(result);
      if (saved) {
        setCurrentReview(saved);
      } else {
        // Fallback if supabase fails but AI worked
        setCurrentReview(result);
        alert("Generated but failed to save to database. Check console/API keys.");
      }
    } else {
      alert("AI分析失败，请检查API Key配置。");
    }
    
    setLoading(false);
    setUserInput('');
  };

  return (
    <div className="min-h-screen pb-24 relative max-w-md mx-auto bg-[#F2F2F7] sm:shadow-2xl sm:min-h-[800px] sm:my-10 sm:rounded-[3rem] overflow-hidden border-x border-gray-200">
      
      {/* Top Navigation / Header */}
      <header className="px-6 pt-12 pb-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200/50">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-600 fill-red-100" />
            A股超短线
          </h1>
          <button 
            onClick={() => setShowInputModal(true)}
            className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 space-y-4 min-h-[60vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-500 text-sm animate-pulse">正在深度复盘与选股...</p>
          </div>
        ) : !currentReview ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <LayoutDashboard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium mb-2">暂无今日数据</h3>
            <p className="text-gray-500 text-sm mb-6">点击右上角 "+" 号生成今日复盘或查看历史。</p>
            <button 
              onClick={loadLatestData}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              刷新数据
            </button>
          </div>
        ) : (
          <>
            {/* Market Overview Card */}
            <MarketOverview review={currentReview} />

            {/* Section Header */}
            <div className="flex items-center justify-between px-2 py-2">
              <h3 className="font-bold text-gray-800 text-lg">明日金股 TOP 5</h3>
              <span className="text-xs text-gray-400">AI 辅助决策</span>
            </div>

            {/* Stock List */}
            <div className="space-y-3">
              {currentReview.stock_picks?.map((pick, index) => (
                <StockCard key={index} pick={pick} index={index} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Input Modal */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">输入行情笔记</h3>
              <button onClick={() => setShowInputModal(false)} className="text-gray-400 hover:text-gray-600">关闭</button>
            </div>
            <textarea
              className="w-full bg-gray-50 rounded-xl p-3 h-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              placeholder="粘贴今日市场新闻、涨跌停数据或个人观察... (留空则由AI全自动生成)"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button 
              onClick={handleGenerate}
              className="w-full bg-black text-white py-3.5 rounded-2xl font-semibold active:scale-95 transition-transform"
            >
              开始AI复盘
            </button>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar (iOS style) */}
      <nav className="absolute bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-6 pt-2 px-6 flex justify-around items-center z-10">
        <button 
          onClick={() => setActiveTab(Tab.TODAY)}
          className={`flex flex-col items-center gap-1 ${activeTab === Tab.TODAY ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">今日</span>
        </button>
        <button 
          onClick={() => alert("历史记录功能待开发 (Check Supabase for data)")}
          className={`flex flex-col items-center gap-1 ${activeTab === Tab.HISTORY ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <History className="w-6 h-6" />
          <span className="text-[10px] font-medium">历史</span>
        </button>
      </nav>
    </div>
  );
};

export default App;