'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { 
  findUserByStudentId, 
  drawLottery, 
  hasUserParticipated, 
  getPrizes 
} from '@/lib/storage';
import { User, Prize, LotteryRecord } from '@/types';
import PrizeCard from '@/components/PrizeCard';
import LotteryWheel from '@/components/LotteryWheel';

export default function LotteryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [lotteryResult, setLotteryResult] = useState<LotteryRecord | null>(null);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [winningPrizeId, setWinningPrizeId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
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
    
    // 检查用户是否已经参与过抽奖
    setHasParticipated(hasUserParticipated(storedStudentId));
    
    // 获取奖品列表
    setPrizes(getPrizes());
  }, [router]);
  
  const handleDraw = () => {
    if (!user) return;
    
    setIsDrawing(true);
    setShowResult(false);
    
    // 预先确定抽奖结果但不显示
    const result = drawLottery(user);
    setLotteryResult(result);
    setHasParticipated(true);
    
    // 如果中奖，设置中奖奖品ID以便转盘定位
    if (result.won && result.prizeId) {
      setWinningPrizeId(result.prizeId);
    } else {
      setWinningPrizeId(null);
    }
    
    // 开始旋转转盘
    setIsWheelSpinning(true);
  };
  
  const handleSpinEnd = () => {
    setIsWheelSpinning(false);
    setIsDrawing(false);
    setShowResult(true);
    
    // 显示抽奖结果提示
    if (lotteryResult?.won) {
      toast.success(`恭喜你获得了${lotteryResult.prizeName}！`);
    } else {
      toast.info('很遗憾，你没有中奖。');
    }
  };
  
  if (!user) {
    return <div className="text-center py-8">加载中...</div>;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">班级抽奖</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">欢迎, {user.name}</h2>
          <p className="text-gray-600">学号: {user.studentId}</p>
        </div>
        
        {hasParticipated ? (
          <div className="text-center">
            {prizes.length > 0 && (
              <LotteryWheel 
                prizes={prizes} 
                isSpinning={isWheelSpinning} 
                onSpinEnd={handleSpinEnd}
                winningPrizeId={winningPrizeId}
              />
            )}
            
            {showResult && lotteryResult && (
              <div>
                <h3 className="text-xl font-bold mb-4">
                  {lotteryResult.won ? '恭喜你中奖了！' : '很遗憾，你没有中奖。'}
                </h3>
                
                {lotteryResult.won && lotteryResult.prizeId && (
                  <div className="max-w-sm mx-auto">
                    <PrizeCard 
                      prize={prizes.find((p: Prize) => p.id === lotteryResult.prizeId) as Prize} 
                      isWinning={true} 
                    />
                  </div>
                )}
              </div>
            )}
            
            {!isWheelSpinning && !showResult && (
              <p className="text-lg">你已经参与过抽奖，不能重复参与。</p>
            )}
            
            {!isWheelSpinning && (
              <div className="mt-6">
                <button
                  onClick={() => router.push('/my-records')}
                  className="btn btn-primary"
                >
                  查看我的记录
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            {prizes.length > 0 && (
              <LotteryWheel 
                prizes={prizes} 
                isSpinning={isWheelSpinning} 
                onSpinEnd={handleSpinEnd}
                winningPrizeId={winningPrizeId}
              />
            )}
            
            <p className="text-lg mb-6">点击下方按钮开始抽奖，祝你好运！</p>
            
            <button
              onClick={handleDraw}
              disabled={isDrawing}
              className="btn btn-primary text-lg px-8 py-3 animate-pulse"
            >
              {isDrawing ? '抽奖中...' : '开始抽奖'}
            </button>
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">奖品列表</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prizes.map((prize: Prize) => (
            <PrizeCard key={prize.id} prize={prize} />
          ))}
        </div>
      </div>
    </div>
  );
} 