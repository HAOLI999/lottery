'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { initStorage } from '@/lib/storage';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 初始化本地存储
    initStorage();
  }, []);

  return (
    <html lang="zh-CN">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
} 