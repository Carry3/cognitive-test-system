export interface TrialResult {
  trialNumber: number;
  correct: boolean;
  reactionTime?: number; // 反应时间（毫秒），如果未响应或提前点击则为 undefined
  timestamp: number; // 该轮开始的时间戳
  metadata?: {
    // 游戏特定的额外信息
    tooEarly?: boolean; // 是否提前点击（Simple Reaction）
    timeout?: boolean; // 是否超时未响应
    expectedKey?: string; // 期望的按键（Choice Reaction）
    actualKey?: string; // 实际按下的键（Choice Reaction）
    isGoTrial?: boolean; // 是否为 Go 试次（Go/No-Go）
    isMatch?: boolean; // 是否匹配（N-Back）
    [key: string]: unknown; // 允许其他游戏特定的元数据
  };
}

export interface GameResult {
  avg: number; // 平均反应时间（仅计算正确响应的试次）
  accuracy: number; // 准确率（百分比）
  trials: TrialResult[]; // 每一轮的详细结果
}

export interface GameProps {
  onFinish: (result: GameResult) => void;
  onUpdateStats: (count: number, hits: number) => void;
}

