import React from 'react';
import { DailyReview } from '../types';
import { Activity, Zap } from './Icons';

interface MarketOverviewProps {
  review: DailyReview;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ review }) => {
  const getSentimentColor = (score: number) => {
    if (score > 70) return 'text-red-500'; // Bullish in China
    if (score < 40) return 'text-green-500'; // Bearish
    return 'text-yellow-500';
  };

  const getSentimentBg = (score: number) => {
    if (score > 70) return 'bg-red-500';
    if (score < 40) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-3xl ${getSentimentBg(review.sentiment_score)}`} />
      
      <div className="flex justify-between items-center mb-4">
        <div>
           <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{review.date}</p>
           <h2 className="text-2xl font-bold text-gray-900 mt-1">市场情绪</h2>
        </div>
        <div className="flex flex-col items-end">
          <div className={`text-4xl font-bold ${getSentimentColor(review.sentiment_score)}`}>
            {review.sentiment_score}
          </div>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {review.hot_sectors.map((sector, i) => (
          <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
            <Zap className="w-3 h-3 mr-1 fill-current" />
            {sector}
          </span>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <Activity className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">
            {review.summary}
          </p>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-400 text-right">
        成交量分析: {review.volume_analysis}
      </div>
    </div>
  );
};

export default MarketOverview;