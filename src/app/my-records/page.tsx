'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserLotteryRecords, findUserByStudentId } from '@/lib/storage';
import { User, LotteryRecord } from '@/types';
import RecordItem from '@/components/RecordItem';

export default function MyRecordsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<LotteryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // 获取当前用户
    const storedStudentId = localStorage.getItem('currentStudentId');
    
    if (!storedStudentId) {
      // 未登录，重定向到登录页
      router.push('/login');
      return;
    }
    
    const currentUser = findUserByStudentId(storedStudentId);
    
    if (!currentUser) {
      // 用户不存在，重定向到登录页
      localStorage.removeItem('currentStudentId');
      router.push('/login');
      return;
    }
    
    setUser(currentUser);
    
    // 获取用户的抽奖记录
    const userRecords = getUserLotteryRecords(storedStudentId);
    setRecords(userRecords);
    setLoading(false);
  }, [router]);
  
  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">我的抽奖记录</h1>
      
      {user && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <p className="font-semibold">学号: {user.studentId}</p>
          <p className="font-semibold">姓名: {user.name}</p>
        </div>
      )}
      
      {records.length > 0 ? (
        <div>
          {records.map((record) => (
            <RecordItem key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white shadow-md rounded-lg">
          <p className="text-gray-500">暂无抽奖记录</p>
          <button
            onClick={() => router.push('/lottery')}
            className="btn btn-primary mt-4"
          >
            去抽奖
          </button>
        </div>
      )}
    </div>
  );
} 