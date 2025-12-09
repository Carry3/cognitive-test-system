import apiClient from './apiClient';
import type {
    TestType,
    StartTestRequest,
    StartTestResponse,
    CompleteTestRequest,
    CompleteTestResponse,
} from '../types/testTypes';

/**
 * Get all available test types
 */
export const getTestTypes = async (): Promise<TestType[]> => {
    try {
        const response = await apiClient.get<TestType[]>('/api/tests/types');
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch test types:', error);
        throw error;
    }
};

/**
 * Start a new test
 */
export const startTest = async (testType: string): Promise<StartTestResponse> => {
    try {
        const response = await apiClient.post<StartTestResponse>(
            '/api/tests/start',
            { testType } as StartTestRequest
        );
        return response.data;
    } catch (error: any) {
        console.error('Failed to start test:', error);
        throw error;
    }
};

/**
 * Complete a test and submit results
 */
export const completeTest = async (
    testId: number,
    data: CompleteTestRequest
): Promise<CompleteTestResponse> => {
    try {
        const response = await apiClient.post<CompleteTestResponse>(
            `/api/tests/${testId}/complete`,
            data
        );
        return response.data;
    } catch (error: any) {
        console.error('Failed to complete test:', error);
        throw error;
    }
};

/**
 * Get test result details
 */
export const getTestResult = async (testId: number): Promise<CompleteTestResponse> => {
    try {
        const response = await apiClient.get<CompleteTestResponse>(`/api/tests/${testId}`);
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch test result:', error);
        throw error;
    }
};

/**
 * Get test history for current user
 */
export const getTestHistory = async (testType?: string): Promise<import('../types/testTypes').TestHistory[]> => {
    try {
        const url = testType
            ? `/api/tests/history?testType=${testType}`
            : '/api/tests/history';
        const response = await apiClient.get<import('../types/testTypes').TestHistory[]>(url);
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch test history:', error);
        throw error;
    }
};

/**
 * Get global leaderboard (top performers across all tests)
 */
export const getGlobalLeaderboard = async (limit: number = 100): Promise<import('../types/testTypes').LeaderboardEntry[]> => {
    try {
        const response = await apiClient.get<import('../types/testTypes').LeaderboardEntry[]>(
            `/api/leaderboard/global?limit=${limit}`
        );
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch global leaderboard:', error);
        throw error;
    }
};

/**
 * Get leaderboard for a specific test type
 */
export const getTestTypeLeaderboard = async (
    testType: string,
    limit: number = 100
): Promise<import('../types/testTypes').LeaderboardEntry[]> => {
    try {
        const response = await apiClient.get<import('../types/testTypes').LeaderboardEntry[]>(
            `/api/leaderboard/test-type/${testType}?limit=${limit}`
        );
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch test type leaderboard:', error);
        throw error;
    }
};

/**
 * Get current user's statistics
 */
export const getUserStatistics = async (): Promise<import('../types/testTypes').UserStatistics> => {
    try {
        const response = await apiClient.get<import('../types/testTypes').UserStatistics>(
            '/api/users/statistics'
        );
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch user statistics:', error);
        throw error;
    }
};
