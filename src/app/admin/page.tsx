'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { 
  findUserByStudentId, 
  getLotteryRecords, 
  getWinningRecords,
  getPrizes,
  getUsers
} from '@/lib/storage';
import { User, LotteryRecord, Prize } from '@/types';
import RecordItem from '@/components/RecordItem';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [allRecords, setAllRecords] = useState<LotteryRecord[]>([]);
  const [winningRecords, setWinningRecords] = useState<LotteryRecord[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('all');
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
    
    if (!currentUser || !currentUser.isAdmin) {
      // 不是管理员，重定向到首页
      toast.error('您没有管理员权限');
      router.push('/');
      return;
    }
    
    setUser(currentUser);
    
    // 获取所有记录
    setAllRecords(getLotteryRecords());
    
    // 获取中奖记录
    setWinningRecords(getWinningRecords());
    
    // 获取奖品列表
    setPrizes(getPrizes());
    
    // 获取用户列表
    setUsers(getUsers());
    
    setLoading(false);
  }, [router]);
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">所有抽奖记录 ({allRecords.length})</h2>
            {allRecords.length > 0 ? (
              <div>
                {allRecords.map((record) => (
                  <RecordItem key={record.id} record={record} showStudent={true} />
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">暂无抽奖记录</p>
            )}
          </div>
        );
      case 'winning':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">中奖记录 ({winningRecords.length})</h2>
            {winningRecords.length > 0 ? (
              <div>
                {winningRecords.map((record) => (
                  <RecordItem key={record.id} record={record} showStudent={true} />
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">暂无中奖记录</p>
            )}
          </div>
        );
      case 'prizes':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">奖品管理</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">ID</th>
                    <th className="py-2 px-4 border-b text-left">名称</th>
                    <th className="py-2 px-4 border-b text-left">描述</th>
                    <th className="py-2 px-4 border-b text-left">等级</th>
                    <th className="py-2 px-4 border-b text-left">剩余数量</th>
                  </tr>
                </thead>
                <tbody>
                  {prizes.map((prize) => (
                    <tr key={prize.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{prize.id}</td>
                      <td className="py-2 px-4 border-b">{prize.name}</td>
                      <td className="py-2 px-4 border-b">{prize.description}</td>
                      <td className="py-2 px-4 border-b">{prize.level}</td>
                      <td className="py-2 px-4 border-b">{prize.remaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'users':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">用户管理 ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">学号</th>
                    <th className="py-2 px-4 border-b text-left">姓名</th>
                    <th className="py-2 px-4 border-b text-left">角色</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{user.studentId}</td>
                      <td className="py-2 px-4 border-b">{user.name}</td>
                      <td className="py-2 px-4 border-b">
                        {user.isAdmin ? (
                          <span className="bg-primary text-white px-2 py-1 rounded text-xs">
                            管理员
                          </span>
                        ) : (
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                            学生
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">管理后台</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-primary font-semibold' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            所有记录
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'winning' ? 'border-b-2 border-primary font-semibold' : ''}`}
            onClick={() => setActiveTab('winning')}
          >
            中奖记录
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'prizes' ? 'border-b-2 border-primary font-semibold' : ''}`}
            onClick={() => setActiveTab('prizes')}
          >
            奖品管理
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-primary font-semibold' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            用户管理
          </button>
        </div>
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
} 