'use client';

import { LotteryRecord } from '@/types';

interface RecordItemProps {
  record: LotteryRecord;
  showStudent?: boolean;
}

export default function RecordItem({ record, showStudent = false }: RecordItemProps) {
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  
  // 根据奖品等级获取样式
  const getLevelStyle = (level: number | null) => {
    if (!level) return 'bg-gray-200 text-gray-700';
    
    switch (level) {
      case 1:
        return 'bg-yellow-500 text-white';
      case 2:
        return 'bg-gray-400 text-white';
      case 3:
        return 'bg-amber-600 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };
  
  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          {showStudent && (
            <div className="mb-2">
              <span className="font-semibold">学号:</span> {record.studentId}
              <span className="ml-4 font-semibold">姓名:</span> {record.userName}
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            <span>抽奖时间: {formatDate(record.timestamp)}</span>
          </div>
        </div>
        
        <div>
          {record.won ? (
            <span className={`px-3 py-1 rounded-full text-sm ${getLevelStyle(record.prizeLevel)}`}>
              {record.prizeName}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">
              未中奖
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 