'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPrizes, getWinningRecords } from '@/lib/storage';
import { Prize, LotteryRecord } from '@/types';
import PrizeCard from '@/components/PrizeCard';
import RecordItem from '@/components/RecordItem';

export default function Home() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winningRecords, setWinningRecords] = useState<LotteryRecord[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // 获取奖品数据
    setPrizes(getPrizes());
    
    // 获取中奖记录
    setWinningRecords(getWinningRecords().slice(0, 5)); // 只显示最近5条
    
    // 检查登录状态
    const storedStudentId = localStorage.getItem('currentStudentId');
    setIsLoggedIn(!!storedStudentId);
  }, []);
  
  return (
    <div>
      <section className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">欢迎使用班级抽奖系统</h1>
          <p className="text-xl text-gray-600">输入你的学号和姓名，参与精彩抽奖！</p>
          
          {!isLoggedIn && (
            <div className="mt-6">
              <Link 
                href="/login" 
                className="btn btn-primary text-lg px-6 py-3"
              >
                立即登录
              </Link>
            </div>
          )}
          
          {isLoggedIn && (
            <div className="mt-6">
              <Link 
                href="/lottery" 
                className="btn btn-primary text-lg px-6 py-3"
              >
                开始抽奖
              </Link>
            </div>
          )}
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">奖品展示</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prizes.map((prize) => (
            <PrizeCard key={prize.id} prize={prize} />
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">最新中奖名单</h2>
        {winningRecords.length > 0 ? (
          <div>
            {winningRecords.map((record) => (
              <RecordItem key={record.id} record={record} showStudent={true} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">暂无中奖记录</p>
        )}
      </section>
    </div>
  );
} 