import React, { useEffect, useState } from 'react';
import { getGlobalLeaderboard, getTestTypeLeaderboard, getUserStatistics, getTestTypes } from '../services/testService';
import type { LeaderboardEntry, UserStatistics, TestType } from '../types/testTypes';

type TabType = 'global' | 'byTest' | 'personal';

const Leaderboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('global');
    const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [testTypeLeaderboard, setTestTypeLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userStats, setUserStats] = useState<UserStatistics | null>(null);
    const [testTypes, setTestTypes] = useState<TestType[]>([]);
    const [selectedTestType, setSelectedTestType] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch test types on mount
    useEffect(() => {
        const fetchTestTypes = async () => {
            try {
                const types = await getTestTypes();
                setTestTypes(types);
                if (types.length > 0) {
                    setSelectedTestType(types[0].type);
                }
            } catch (err) {
                console.error('Failed to load test types:', err);
            }
        };
        fetchTestTypes();
    }, []);

    // Fetch data based on active tab
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (activeTab === 'global') {
                    const data = await getGlobalLeaderboard(100);
                    setGlobalLeaderboard(data);
                } else if (activeTab === 'byTest' && selectedTestType) {
                    const data = await getTestTypeLeaderboard(selectedTestType, 100);
                    setTestTypeLeaderboard(data);
                } else if (activeTab === 'personal') {
                    const data = await getUserStatistics();
                    setUserStats(data);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, selectedTestType]);

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'var(--duo-yellow)';
        if (rank === 2) return '#C0C0C0';
        if (rank === 3) return '#CD7F32';
        return 'var(--text-color)';
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '60px', marginBottom: '10px' }}>🏆</div>
                <h1>Leaderboard</h1>
                <p style={{ color: '#999' }}>See how you rank against other players</p>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '30px',
                borderBottom: '2px solid #e5e5e5',
                justifyContent: 'center'
            }}>
                <button
                    onClick={() => setActiveTab('global')}
                    style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'global' ? '3px solid var(--duo-green)' : '3px solid transparent',
                        color: activeTab === 'global' ? 'var(--duo-green)' : '#999',
                        fontWeight: activeTab === 'global' ? '800' : '600',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    🌍 Global Rankings
                </button>
                <button
                    onClick={() => setActiveTab('byTest')}
                    style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'byTest' ? '3px solid var(--duo-green)' : '3px solid transparent',
                        color: activeTab === 'byTest' ? 'var(--duo-green)' : '#999',
                        fontWeight: activeTab === 'byTest' ? '800' : '600',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    🎯 By Test Type
                </button>
                <button
                    onClick={() => setActiveTab('personal')}
                    style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'personal' ? '3px solid var(--duo-green)' : '3px solid transparent',
                        color: activeTab === 'personal' ? 'var(--duo-green)' : '#999',
                        fontWeight: activeTab === 'personal' ? '800' : '600',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    📊 My Statistics
                </button>
            </div>

            {/* Test Type Selector (for byTest tab) */}
            {activeTab === 'byTest' && testTypes.length > 0 && (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <select
                        value={selectedTestType}
                        onChange={(e) => setSelectedTestType(e.target.value)}
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            borderRadius: '12px',
                            border: '2px solid #e5e5e5',
                            background: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        {testTypes.map((type) => (
                            <option key={type.type} value={type.type}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
                    <p>Loading...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    background: '#fff0f0',
                    borderRadius: '16px'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
                    <p style={{ color: '#d00' }}>{error}</p>
                </div>
            )}

            {/* Global Leaderboard */}
            {!loading && !error && activeTab === 'global' && (
                <div>
                    {globalLeaderboard.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            <p>No data available yet</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {globalLeaderboard.map((entry) => (
                                <div
                                    key={entry.userId}
                                    className="test-card"
                                    style={{
                                        cursor: 'default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        padding: '20px'
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '32px',
                                            fontWeight: '800',
                                            color: getRankColor(entry.rank),
                                            minWidth: '60px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {getRankIcon(entry.rank)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>
                                            {entry.username}
                                        </div>
                                        <div style={{ color: '#999', fontSize: '14px' }}>
                                            {entry.totalTests} tests completed
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                                            Avg Reaction
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--duo-blue)' }}>
                                            {entry.avgReactionTime.toFixed(0)}ms
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                                            Accuracy
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--duo-green)' }}>
                                            {(entry.accuracyRate * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Test Type Leaderboard */}
            {!loading && !error && activeTab === 'byTest' && (
                <div>
                    {testTypeLeaderboard.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            <p>No data available for this test type yet</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {testTypeLeaderboard.map((entry) => (
                                <div
                                    key={entry.userId}
                                    className="test-card"
                                    style={{
                                        cursor: 'default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        padding: '20px'
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '32px',
                                            fontWeight: '800',
                                            color: getRankColor(entry.rank),
                                            minWidth: '60px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {getRankIcon(entry.rank)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>
                                            {entry.username}
                                        </div>
                                        <div style={{ color: '#999', fontSize: '14px' }}>
                                            Score: {entry.score.toFixed(0)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                                            Avg Reaction
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--duo-blue)' }}>
                                            {entry.avgReactionTime.toFixed(0)}ms
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                                            Accuracy
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--duo-green)' }}>
                                            {(entry.accuracyRate * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Personal Statistics */}
            {!loading && !error && activeTab === 'personal' && userStats && (
                <div>
                    {/* Overall Stats */}
                    <div className="test-card" style={{
                        cursor: 'default',
                        marginBottom: '20px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '20px',
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                                Total Tests
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-color)' }}>
                                {userStats.totalTestsCompleted}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                                Avg Accuracy
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--duo-green)' }}>
                                {(userStats.averageAccuracy * 100).toFixed(0)}%
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                                Avg Reaction
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--duo-blue)' }}>
                                {userStats.averageReactionTime.toFixed(0)}ms
                            </div>
                        </div>
                    </div>

                    {/* Best Performance */}
                    {userStats.bestPerformance && (
                        <div className="test-card" style={{
                            cursor: 'default',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🌟</div>
                            <h3 style={{ marginBottom: '8px' }}>Best Performance</h3>
                            <div style={{ fontSize: '18px', color: '#666', marginBottom: '8px' }}>
                                {userStats.bestPerformance.testName}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--duo-yellow)' }}>
                                Top {(100 - userStats.bestPerformance.percentile).toFixed(1)}%
                            </div>
                        </div>
                    )}

                    {/* Test Type Stats */}
                    <h3 style={{ marginBottom: '16px' }}>Performance by Test Type</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {userStats.testTypeStats.map((stat) => (
                            <div
                                key={stat.testType}
                                className="test-card"
                                style={{
                                    cursor: 'default',
                                    padding: '20px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div>
                                        <h4 style={{ margin: 0, marginBottom: '4px' }}>{stat.testName}</h4>
                                        <div style={{ color: '#999', fontSize: '14px' }}>
                                            {stat.testsCompleted} tests completed
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--duo-yellow)' }}>
                                            Top {(100 - stat.percentile).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                                            Best Score
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-color)' }}>
                                            {stat.bestScore.toFixed(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                                            Avg Accuracy
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--duo-green)' }}>
                                            {(stat.averageAccuracy * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                                            Avg Reaction
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--duo-blue)' }}>
                                            {stat.averageReactionTime.toFixed(0)}ms
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
