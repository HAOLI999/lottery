'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createOrGetUser, findUserByStudentId } from '@/lib/storage';

export default function Login() {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // 如果已经登录，重定向到首页
    const storedStudentId = localStorage.getItem('currentStudentId');
    if (storedStudentId) {
      router.push('/');
    }
  }, [router]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!studentId.trim() || !name.trim()) {
      toast.error('请输入学号和姓名');
      return;
    }
    
    setLoading(true);
    
    try {
      // 创建或获取用户
      const user = createOrGetUser(studentId, name);
      
      // 保存当前用户ID到本地存储
      localStorage.setItem('currentStudentId', user.studentId);
      
      toast.success('登录成功');
      
      // 根据用户类型重定向
      if (user.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error) {
      toast.error('登录失败，请重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">用户登录</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="studentId" className="block text-gray-700 font-medium mb-2">
            学号
          </label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="input-field"
            placeholder="请输入你的学号"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            姓名
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="请输入你的姓名"
            required
          />
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>管理员请使用管理员账号登录</p>
          <p className="mt-1">学生首次登录将自动注册</p>
        </div>
      </form>
    </div>
  );
} 