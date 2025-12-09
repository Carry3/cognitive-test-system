// Test Types
export interface TestType {
    type: string;
    name: string;
}

export interface StartTestRequest {
    testType: string;
}

export interface StartTestResponse {
    testId: number;
    testType: string;
    testName: string;
    message: string;
}

export interface TestRound {
    trialNumber: number;
    stimulus: string;
    response: string;
    reactionTime: number;
    isCorrect: boolean;
}

export interface CompleteTestRequest {
    totalTimeMs: number;
    totalTrials: number;
    correctTrials: number;
    rounds: TestRound[];
}

export interface TestStatistics {
    totalTrials: number;
    correctTrials: number;
    accuracyRate: number;
    avgReactionTime: number;
    medianReactionTime: number;
    stdDeviation: number;
    fastestTime: number;
    slowestTime: number;
}

export interface BrainRegion {
    region: string;
    regionName: string;
    abbreviation: string;
    description: string;
}

export interface TestRank {
    percentile: number;
    description: string;
}

export interface CompleteTestResponse {
    testId: number;
    testType: string;
    testName: string;
    status: string;
    startTime: string;
    endTime: string;
    totalTimeMs: number;
    statistics: TestStatistics;
    brainRegions: BrainRegion[];
    rank: TestRank;
    rounds: TestRound[];
}

export interface TestHistory {
    testId: number;
    testType: string;
    testName: string;
    status: string;
    startTime: string;
    endTime: string;
    totalTimeMs: number;
    totalTrials: number;
    correctTrials: number;
    accuracyRate: number;
    avgReactionTime: number;
    percentileRank: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
    rank: number;
    userId: number;
    username: string;
    email: string;
    score: number;
    avgReactionTime: number;
    accuracyRate: number;
    totalTests: number;
    testType?: string;
    testName?: string;
}

// Statistics Types
export interface TestTypeCount {
    testType: string;
    testName: string;
    count: number;
}

export interface GlobalStatistics {
    totalUsers: number;
    totalTests: number;
    totalTestsToday: number;
    testTypeCounts: TestTypeCount[];
}

export interface RankingEntry {
    rank: number;
    username: string;
    testCount: number;
    avgAccuracy: number | null;
    avgReactionTime: number | null;
}

export interface CurrentUserRank {
    rank: number;
    testCount: number;
}

export interface LeaderboardResponse {
    rankings: RankingEntry[];
    totalUsers: number;
    currentUser: CurrentUserRank | null;
}

export interface DistributionBucket {
    range: string;
    count: number;
    percentage: number;
}

export interface TestTypeStatistics {
    testType: string;
    testName: string;
    totalTests: number;
    avgReactionTime: number;
    minReactionTime: number;
    maxReactionTime: number;
    avgAccuracy: number;
    minAccuracy: number;
    maxAccuracy: number;
    reactionTimeDistribution: DistributionBucket[];
    accuracyDistribution: DistributionBucket[];
}

export interface UserStatistics {
    totalTestsCompleted: number;
    averageAccuracy: number;
    averageReactionTime: number;
    bestPerformance: {
        testType: string;
        testName: string;
        score: number;
        percentile: number;
    };
    testTypeStats: TestTypeStats[];
}

export interface TestTypeStats {
    testType: string;
    testName: string;
    testsCompleted: number;
    averageAccuracy: number;
    averageReactionTime: number;
    bestScore: number;
    rank: number;
    percentile: number;
}
