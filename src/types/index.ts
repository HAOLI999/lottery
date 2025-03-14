export interface User {
  id: string;
  studentId: string;
  name: string;
  isAdmin: boolean;
}

export interface Prize {
  id: number;
  name: string;
  description: string;
  level: 1 | 2 | 3; // 1 = 一等奖, 2 = 二等奖, 3 = 三等奖
  remaining: number;
}

export interface LotteryRecord {
  id: string;
  userId: string;
  studentId: string;
  userName: string;
  prizeId: number | null;
  prizeName: string | null;
  prizeLevel: number | null;
  timestamp: string;
  won: boolean;
} 