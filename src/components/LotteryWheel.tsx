'use client';

import { useState, useEffect, useRef } from 'react';
import { Prize } from '@/types';

interface LotteryWheelProps {
  prizes: Prize[];
  isSpinning: boolean;
  onSpinEnd: (prizeIndex: number | null) => void;
  winningPrizeId: number | null;
}

// 创建包含所有结果的完整数据
interface WheelItem {
  id: number | string;
  name: string;
  level: number | null;
  isNoWin?: boolean;
  color: string;
  // 添加概率和扇区角度属性
  probability: number;
  angle: number;
  startAngle: number;
}

export default function LotteryWheel({ 
  prizes, 
  isSpinning, 
  onSpinEnd, 
  winningPrizeId 
}: LotteryWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [finalRotation, setFinalRotation] = useState(0);
  const [wheelItems, setWheelItems] = useState<WheelItem[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 初始化转盘项目
  useEffect(() => {
    // 设置指定的概率
    const prizeProbabilities = {
      1: 0.05,  // 一等奖: 5%
      2: 0.15,  // 二等奖: 15%
      3: 0.25,  // 三等奖: 25%
    };
    
    // 计算总中奖概率和未中奖概率
    const totalWinProbability = 0.05 + 0.15 + 0.25; // 45%
    const totalNoWinProbability = 1 - totalWinProbability; // 55%
    
    // 创建奖品项，根据等级分配概率
    const prizeItems: Partial<WheelItem>[] = prizes.map(prize => ({
      id: prize.id,
      name: prize.name,
      level: prize.level,
      isNoWin: false,
      color: getLevelColor(prize.level),
      // 根据奖品等级分配对应概率
      probability: prize.level && prizeProbabilities[prize.level] 
        ? prizeProbabilities[prize.level] 
        : 0.05 // 默认概率
    }));
    
    // 创建未中奖项（分成几个区域）
    const noWinSections = 2; // 未中奖分成2个区域
    const noWinItems: Partial<WheelItem>[] = Array.from({ length: noWinSections }, (_, i) => ({
      id: `no-win-${i}`,
      name: '未中奖',
      level: null,
      isNoWin: true,
      color: '#cccccc',
      probability: totalNoWinProbability / noWinSections
    }));
    
    // 合并所有项目
    let combinedItems: Partial<WheelItem>[] = [...prizeItems, ...noWinItems];
    
    // 计算每个项目的角度和起始角度
    let currentAngle = 0;
    const itemsWithAngles = combinedItems.map(item => {
      const angle = 360 * (item.probability || 0);
      const startAngle = currentAngle;
      currentAngle += angle;
      
      return {
        ...item,
        angle,
        startAngle
      } as WheelItem;
    });
    
    // 随机打乱顺序（但保持角度分配）
    const shuffledItems = shuffleArray(itemsWithAngles);
    
    // 重新计算起始角度
    let newCurrentAngle = 0;
    const finalItems = shuffledItems.map(item => {
      const startAngle = newCurrentAngle;
      newCurrentAngle += item.angle;
      
      return {
        ...item,
        startAngle
      };
    });
    
    setWheelItems(finalItems);
  }, [prizes]);
  
  // 随机打乱数组
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // 根据奖品等级获取颜色
  const getLevelColor = (level: number | null): string => {
    switch (level) {
      case 1: return '#FFD700'; // 一等奖 - 金色
      case 2: return '#C0C0C0'; // 二等奖 - 银色
      case 3: return '#CD7F32'; // 三等奖 - 铜色
      default: return '#f0f0f0'; // 默认颜色
    }
  };
  
  // 重置转盘
  useEffect(() => {
    if (!isSpinning) {
      setRotation(0);
    }
  }, [isSpinning]);
  
  // 处理转盘旋转
  useEffect(() => {
    if (isSpinning && wheelItems.length > 0) {
      // 清除之前的timeout
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
      
      // 计算旋转角度
      const minRotations = 5; // 最少转动5圈
      const baseRotation = minRotations * 360;
      
      let targetRotation = baseRotation;
      
      if (winningPrizeId !== null) {
        // 寻找对应奖品在wheelItems中的位置
        const prizeItem = wheelItems.find(
          item => typeof item.id === 'number' && item.id === winningPrizeId
        );
        
        if (prizeItem) {
          // 计算需要旋转到的角度 - 指向该奖品扇区的中间
          const itemMidpoint = prizeItem.startAngle + (prizeItem.angle / 2);
          // 添加随机偏移，使得转盘停止位置看起来更自然
          const randomOffset = (Math.random() * 0.5 - 0.25) * prizeItem.angle;
          // 旋转方向是逆时针，所以用360减去角度
          targetRotation = baseRotation + (360 - itemMidpoint) + randomOffset;
        }
      } else {
        // 寻找未中奖区域
        const noWinItems = wheelItems.filter(item => item.isNoWin);
        
        if (noWinItems.length > 0) {
          // 随机选择一个未中奖区域
          const randomIndex = Math.floor(Math.random() * noWinItems.length);
          const noWinItem = noWinItems[randomIndex];
          
          // 计算需要旋转到的角度
          const itemMidpoint = noWinItem.startAngle + (noWinItem.angle / 2);
          const randomOffset = (Math.random() * 0.5 - 0.25) * noWinItem.angle;
          targetRotation = baseRotation + (360 - itemMidpoint) + randomOffset;
        }
      }
      
      setFinalRotation(targetRotation);
      
      // 设置转动动画
      requestAnimationFrame(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.1, 0.05, 0.15, 1)';
          wheelRef.current.style.transform = `rotate(${targetRotation}deg)`;
        }
      });
      
      // 转动结束的回调
      spinTimeoutRef.current = setTimeout(() => {
        onSpinEnd(winningPrizeId !== null ? prizes.findIndex(p => p.id === winningPrizeId) : null);
      }, 5000); // 5秒后结束
    }
    
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, [isSpinning, wheelItems, prizes, winningPrizeId, onSpinEnd]);
  
  // 如果轮盘项目为空，显示加载中
  if (wheelItems.length === 0) {
    return <div className="text-center py-4">加载转盘中...</div>;
  }
  
  return (
    <div className="flex flex-col items-center justify-center my-6 relative">
      {/* 标题和概率说明 */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold">幸运抽奖转盘</h3>
        <p className="text-sm text-gray-600 mt-1">
          一等奖: 5% | 二等奖: 15% | 三等奖: 25% | 未中奖: 55%
        </p>
      </div>
      
      {/* 闪光效果 */}
      {isSpinning && (
        <div className="absolute w-full h-full pointer-events-none">
          <div className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ left: '45%', top: '25%' }}></div>
          <div className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ left: '55%', top: '25%', animationDelay: '0.5s' }}></div>
          <div className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ left: '65%', top: '35%', animationDelay: '1s' }}></div>
          <div className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ left: '35%', top: '35%', animationDelay: '1.5s' }}></div>
          <div className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ left: '50%', top: '45%', animationDelay: '2s' }}></div>
        </div>
      )}
      
      {/* 转盘容器 */}
      <div className="relative w-80 h-80">
        {/* 指针 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 bg-red-600 transform rotate-45 border-4 border-white shadow-lg" 
               style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}>
          </div>
        </div>
        
        {/* 转盘 */}
        <div 
          ref={wheelRef}
          className="wheel w-80 h-80 rounded-full border-8 border-primary overflow-hidden shadow-xl"
          style={{
            transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0.05, 0.15, 1)' : 'none',
            transform: `rotate(${finalRotation}deg)`,
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}
        >
          {wheelItems.map((item, index) => {
            // 设置不同等级奖品的颜色
            let fillColor = '#e0e0e0'; // 默认为未中奖颜色
            
            if (!item.isNoWin) {
              // 根据等级设置不同颜色
              switch (item.level) {
                case 1:
                  fillColor = '#FFD700'; // 一等奖
                  break;
                case 2:
                  fillColor = '#C0C0C0'; // 二等奖
                  break;
                case 3:
                  fillColor = '#CD7F32'; // 三等奖
                  break;
                default:
                  fillColor = '#f0f0f0';
              }
            }
            
            // 计算扇区路径
            const pathCoordinates = getSegmentPath(
              item.startAngle,
              item.startAngle + item.angle,
              40, // 半径
              0, 0 // 中心点
            );
            
            return (
              <div 
                key={`wheel-segment-${index}`}
                className="absolute"
                style={{
                  width: '100%',
                  height: '100%',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* 使用SVG绘制扇区 */}
                <svg width="100%" height="100%" viewBox="-40 -40 80 80">
                  <path
                    d={pathCoordinates}
                    fill={fillColor}
                    stroke="#ffffff"
                    strokeWidth="0.5"
                  />
                  {/* 添加渐变效果 */}
                  {!item.isNoWin && (
                    <path
                      d={pathCoordinates}
                      fill="url(#shine)"
                      fillOpacity="0.3"
                      stroke="none"
                    />
                  )}
                  {/* 显示奖品名称 */}
                  <text
                    x={getTextX(item.startAngle + item.angle/2, 25)}
                    y={getTextY(item.startAngle + item.angle/2, 25)}
                    fill={item.isNoWin ? '#666666' : '#ffffff'}
                    fontSize="3"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${item.startAngle + item.angle/2}, ${getTextX(item.startAngle + item.angle/2, 25)}, ${getTextY(item.startAngle + item.angle/2, 25)})`}
                  >
                    {item.name}
                  </text>
                  {/* 显示概率百分比 */}
                  <text
                    x={getTextX(item.startAngle + item.angle/2, 20)}
                    y={getTextY(item.startAngle + item.angle/2, 20)}
                    fill={item.isNoWin ? '#666666' : '#ffffff'}
                    fontSize="2.5"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${item.startAngle + item.angle/2}, ${getTextX(item.startAngle + item.angle/2, 20)}, ${getTextY(item.startAngle + item.angle/2, 20)})`}
                  >
                    {Math.round(item.probability * 100)}%
                  </text>
                  {/* 添加闪光效果的渐变定义 */}
                  <defs>
                    <radialGradient id="shine" cx="0.5" cy="0.5" r="0.5" fx="0.25" fy="0.25">
                      <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            );
          })}
        </div>
        
        {/* 转盘外边框装饰 */}
        <div className="absolute w-80 h-80 rounded-full border-4 border-primary border-opacity-60 pointer-events-none" 
          style={{ 
            top: 0,
            left: 0,
            boxShadow: isSpinning ? '0 0 20px rgba(52, 144, 220, 0.6), 0 0 30px rgba(52, 144, 220, 0.4), 0 0 40px rgba(52, 144, 220, 0.2)' : 'none',
            transition: 'box-shadow 0.5s ease'
          }}
        ></div>
      </div>
      
      {/* 转盘说明 */}
      <div className="mt-8 text-center">
        {isSpinning ? (
          <div className="text-lg font-bold animate-pulse text-primary">
            抽奖中...转盘旋转中！
          </div>
        ) : (
          <div className="text-sm text-gray-600 mt-2">
            <p>转盘区域大小根据概率比例划分</p>
            <p className="mt-1">
              <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>一等奖(5%)
              <span className="inline-block w-3 h-3 bg-gray-400 rounded-full ml-2 mr-1"></span>二等奖(15%)
              <span className="inline-block w-3 h-3 bg-amber-600 rounded-full ml-2 mr-1"></span>三等奖(25%)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 计算扇区路径
function getSegmentPath(startAngle: number, endAngle: number, radius: number, centerX: number, centerY: number): string {
  const startRad = (startAngle - 90) * Math.PI / 180;
  const endRad = (endAngle - 90) * Math.PI / 180;
  
  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY + radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY + radius * Math.sin(endRad);
  
  // 确定是大弧还是小弧
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  
  return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

// 获取文本X坐标
function getTextX(angle: number, distance: number): number {
  const radian = (angle - 90) * Math.PI / 180;
  return distance * Math.cos(radian);
}

// 获取文本Y坐标
function getTextY(angle: number, distance: number): number {
  const radian = (angle - 90) * Math.PI / 180;
  return distance * Math.sin(radian);
} 