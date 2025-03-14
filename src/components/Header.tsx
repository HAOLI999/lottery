'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { findUserByStudentId } from '@/lib/storage';

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentId, setStudentId] = useState('');
  
  useEffect(() => {
    // 检查本地存储中是否有用户信息
    const storedStudentId = localStorage.getItem('currentStudentId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
      setIsLoggedIn(true);
      
      const user = findUserByStudentId(storedStudentId);
      setIsAdmin(user?.isAdmin || false);
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('currentStudentId');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setStudentId('');
    window.location.href = '/';
  };
  
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          班级抽奖系统
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link 
            href="/" 
            className={`hover:text-secondary transition-colors ${pathname === '/' ? 'font-bold' : ''}`}
          >
            首页
          </Link>
          
          {isLoggedIn && (
            <Link 
              href="/lottery" 
              className={`hover:text-secondary transition-colors ${pathname === '/lottery' ? 'font-bold' : ''}`}
            >
              抽奖
            </Link>
          )}
          
          {isLoggedIn && (
            <Link 
              href="/my-records" 
              className={`hover:text-secondary transition-colors ${pathname === '/my-records' ? 'font-bold' : ''}`}
            >
              我的记录
            </Link>
          )}
          
          {isAdmin && (
            <Link 
              href="/admin" 
              className={`hover:text-secondary transition-colors ${pathname === '/admin' ? 'font-bold' : ''}`}
            >
              管理后台
            </Link>
          )}
          
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <span>学号: {studentId}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
              >
                退出
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className={`hover:text-secondary transition-colors ${pathname === '/login' ? 'font-bold' : ''}`}
            >
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
} 