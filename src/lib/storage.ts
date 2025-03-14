import { User, Prize, LotteryRecord } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// 初始奖品数据
const initialPrizes: Prize[] = [
  { id: 1, name: '一等奖', description: '神秘大奖', level: 1, remaining: 1 },
  { id: 2, name: '二等奖', description: '精美礼品', level: 2, remaining: 3 },
  { id: 3, name: '三等奖', description: '纪念奖品', level: 3, remaining: 5 },
];

// 管理员账号
const adminUser: User = {
  id: 'admin-1',
  studentId: 'admin',
  name: 'Administrator',
  isAdmin: true,
};

// 本地存储键名
const USERS_KEY = 'lottery_users';
const PRIZES_KEY = 'lottery_prizes';
const RECORDS_KEY = 'lottery_records';
const ADMIN_KEY = 'lottery_admin';

// 初始化本地存储
export const initStorage = () => {
  if (typeof window === 'undefined') return;
  
  // 初始化奖品
  if (!localStorage.getItem(PRIZES_KEY)) {
    localStorage.setItem(PRIZES_KEY, JSON.stringify(initialPrizes));
  }
  
  // 初始化管理员
  if (!localStorage.getItem(ADMIN_KEY)) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminUser));
  }
  
  // 初始化用户列表
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([adminUser]));
  }
  
  // 初始化抽奖记录
  if (!localStorage.getItem(RECORDS_KEY)) {
    localStorage.setItem(RECORDS_KEY, JSON.stringify([]));
  }
};

// 获取所有用户
export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// 获取所有奖品
export const getPrizes = (): Prize[] => {
  if (typeof window === 'undefined') return initialPrizes;
  const prizes = localStorage.getItem(PRIZES_KEY);
  return prizes ? JSON.parse(prizes) : initialPrizes;
};

// 获取所有抽奖记录
export const getLotteryRecords = (): LotteryRecord[] => {
  if (typeof window === 'undefined') return [];
  const records = localStorage.getItem(RECORDS_KEY);
  return records ? JSON.parse(records) : [];
};

// 根据学生ID查找用户
export const findUserByStudentId = (studentId: string): User | null => {
  const users = getUsers();
  return users.find(user => user.studentId === studentId) || null;
};

// 创建或获取用户
export const createOrGetUser = (studentId: string, name: string): User => {
  const existingUser = findUserByStudentId(studentId);
  
  if (existingUser) {
    return existingUser;
  }
  
  const newUser: User = {
    id: uuidv4(),
    studentId,
    name,
    isAdmin: false,
  };
  
  const users = getUsers();
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  return newUser;
};

// 抽奖逻辑
export const drawLottery = (user: User): LotteryRecord => {
  const prizes = getPrizes();
  const availablePrizes = prizes.filter(prize => prize.remaining > 0);
  
  // 生成随机数决定是否中奖 (30%概率中奖)
  const isWinner = Math.random() < 0.3 && availablePrizes.length > 0;
  
  let selectedPrize: Prize | null = null;
  
  if (isWinner) {
    // 随机选择一个奖品
    const randomIndex = Math.floor(Math.random() * availablePrizes.length);
    selectedPrize = availablePrizes[randomIndex];
    
    // 更新奖品剩余数量
    const updatedPrizes = prizes.map(prize => 
      prize.id === selectedPrize?.id 
        ? { ...prize, remaining: prize.remaining - 1 }
        : prize
    );
    
    localStorage.setItem(PRIZES_KEY, JSON.stringify(updatedPrizes));
  }
  
  // 创建抽奖记录
  const record: LotteryRecord = {
    id: uuidv4(),
    userId: user.id,
    studentId: user.studentId,
    userName: user.name,
    prizeId: selectedPrize?.id || null,
    prizeName: selectedPrize?.name || null,
    prizeLevel: selectedPrize?.level || null,
    timestamp: new Date().toISOString(),
    won: isWinner,
  };
  
  // 保存抽奖记录
  const records = getLotteryRecords();
  records.push(record);
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  
  return record;
};

// 检查用户是否已经抽过奖
export const hasUserParticipated = (studentId: string): boolean => {
  const records = getLotteryRecords();
  return records.some(record => record.studentId === studentId);
};

// 获取用户的抽奖记录
export const getUserLotteryRecords = (studentId: string): LotteryRecord[] => {
  const records = getLotteryRecords();
  return records.filter(record => record.studentId === studentId);
};

// 获取中奖记录
export const getWinningRecords = (): LotteryRecord[] => {
  const records = getLotteryRecords();
  return records.filter(record => record.won);
}; 