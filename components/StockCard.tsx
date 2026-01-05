import React from 'react';
import { StockPick } from '../types';
import { ArrowUpRight } from './Icons';

interface StockCardProps {
  pick: StockPick;
  index: number;
}

const StockCard: React.FC<StockCardProps> = ({ pick, index }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3 active:scale-[0.99] transition-transform duration-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 font-bold text-sm">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{pick.name}</h3>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{pick.code}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="flex items-center text-red-500 font-medium text-sm">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            潜力
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
        {pick.reason}
      </p>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center">
          <span className="text-gray-400 mb-1">建议低吸</span>
          <span className="font-semibold text-gray-800">{pick.entry_price}</span>
        </div>
        <div className="bg-red-50 rounded-lg p-2 flex flex-col items-center">
          <span className="text-red-400 mb-1">目标</span>
          <span className="font-semibold text-red-600">{pick.target_price}</span>
        </div>
        <div className="bg-green-50 rounded-lg p-2 flex flex-col items-center">
          <span className="text-green-400 mb-1">止损</span>
          <span className="font-semibold text-green-600">{pick.stop_loss}</span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;