'use client';

import { Prize } from '@/types';

interface PrizeCardProps {
  prize: Prize;
  isWinning?: boolean;
}

export default function PrizeCard({ prize, isWinning = false }: PrizeCardProps) {
  const levelColors = {
    1: 'bg-yellow-500',
    2: 'bg-gray-400',
    3: 'bg-amber-600',
  };
  
  const levelNames = {
    1: '一等奖',
    2: '二等奖',
    3: '三等奖',
  };
  
  return (
    <div className={`rounded-lg shadow-md overflow-hidden transition-transform duration-300 ${isWinning ? 'scale-105 ring-4 ring-yellow-400' : 'hover:scale-105'}`}>
      <div className={`${levelColors[prize.level]} p-4 text-white`}>
        <h3 className="text-xl font-bold">{prize.name}</h3>
        <span className="text-sm">{levelNames[prize.level]}</span>
      </div>
      
      <div className="p-4 bg-white">
        <p className="text-gray-700">{prize.description}</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            剩余: {prize.remaining}
          </span>
          {isWinning && (
            <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm">
              恭喜中奖!
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 