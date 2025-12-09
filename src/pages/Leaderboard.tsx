import React, { useEffect, useState } from 'react';
import { getGlobalStatistics, getLeaderboard, getTestTypes, getTestTypeStatistics } from '../services/testService';
import type { GlobalStatistics, LeaderboardResponse, TestType, TestTypeStatistics } from '../types/testTypes';

const Leaderboard: React.FC = () => {
    const [globalStats, setGlobalStats] = useState<GlobalStatistics | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
    const [testTypes, setTestTypes] = useState<TestType[]>([]);
    const [selectedTestType, setSelectedTestType] = useState<string>('');
    const [testTypeStats, setTestTypeStats] = useState<TestTypeStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial data on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [statsData, leaderboardData, typesData] = await Promise.all([
                    getGlobalStatistics(),
                    getLeaderboard(100),
                    getTestTypes()
                ]);
                setGlobalStats(statsData);
                setLeaderboard(leaderboardData);
                setTestTypes(typesData);

                // Select first test type by default
                if (typesData.length > 0) {
                    setSelectedTestType(typesData[0].type);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Fetch test type statistics when selection changes
    useEffect(() => {
        const fetchTestTypeStats = async () => {
            if (!selectedTestType) return;

            try {
                const stats = await getTestTypeStatistics(selectedTestType);
                setTestTypeStats(stats);
            } catch (err: any) {
                console.error('Failed to fetch test type statistics:', err);
            }
        };

        fetchTestTypeStats();
    }, [selectedTestType]);

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

    if (loading) {
        return (
            <div id="view-leaderboard">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '60px', marginBottom: '10px' }}>⏳</div>
                    <h1>Loading...</h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div id="view-leaderboard">
                <div style={{ textAlign: 'center', padding: '40px', background: '#fff0f0', borderRadius: '16px' }}>
                    <div style={{ fontSize: '60px', marginBottom: '10px' }}>⚠️</div>
                    <h1>Loading Failed</h1>
                    <p style={{ color: '#d00' }}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div id="view-leaderboard">
            {/* Page Title */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
                <h1 style={{ margin: 0, marginBottom: '8px' }}>Leaderboard</h1>
                <p style={{ color: '#999', margin: 0 }}>View your ranking compared to other users</p>
            </div>

            {globalStats && (
                <>
                    {/* Global Statistics Cards */}
                    <h3 style={{ marginBottom: '20px' }}>Platform Statistics</h3>
                    <div className="test-grid" style={{ marginBottom: '40px' }}>
                        <div className="test-card" style={{
                            cursor: 'default',
                            textAlign: 'center',
                            background: 'white',
                            borderColor: 'var(--duo-blue)',
                            top: 0
                        }} onMouseEnter={(e) => e.currentTarget.style.top = '0'}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>👥</div>
                            <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--duo-blue)' }}>
                                {globalStats.totalUsers.toLocaleString()}
                            </h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px', fontWeight: '600' }}>Total Users</p>
                        </div>

                        <div className="test-card" style={{
                            cursor: 'default',
                            textAlign: 'center',
                            background: 'white',
                            borderColor: 'var(--duo-green)',
                            top: 0
                        }} onMouseEnter={(e) => e.currentTarget.style.top = '0'}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
                            <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--duo-green)' }}>
                                {globalStats.totalTests.toLocaleString()}
                            </h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px', fontWeight: '600' }}>Total Tests</p>
                        </div>

                        <div className="test-card" style={{
                            cursor: 'default',
                            textAlign: 'center',
                            background: 'white',
                            borderColor: 'var(--duo-yellow)',
                            top: 0
                        }} onMouseEnter={(e) => e.currentTarget.style.top = '0'}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔥</div>
                            <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--duo-yellow)' }}>
                                {globalStats.totalTestsToday.toLocaleString()}
                            </h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px', fontWeight: '600' }}>Today's Tests</p>
                        </div>
                    </div>
                </>
            )}

            {/* Two Column Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                gap: '30px'
            }}>
                {/* Left: Leaderboard Rankings */}
                {leaderboard && (
                    <div>
                        <h3 style={{ marginBottom: '20px' }}>🌟 Leaderboard</h3>

                        {/* Current User Rank */}
                        {leaderboard.currentUser && (
                            <div className="test-card" style={{
                                cursor: 'default',
                                marginBottom: '20px',
                                padding: '20px',
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                color: 'white',
                                borderColor: '#fa709a',
                                top: 0
                            }} onMouseEnter={(e) => e.currentTarget.style.top = '0'}>
                                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎯</div>
                                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Your Rank</div>
                                <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '4px' }}>
                                    #{leaderboard.currentUser.rank}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                                    {leaderboard.currentUser.testCount} tests
                                </div>
                            </div>
                        )}

                        {/* Rankings List */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            maxHeight: '800px',
                            overflowY: 'auto',
                            paddingRight: '10px'
                        }}>
                            {leaderboard.rankings.map((entry) => (
                                <div
                                    key={entry.rank}
                                    className="test-card"
                                    style={{
                                        cursor: 'default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px',
                                        background: entry.rank <= 3
                                            ? `linear-gradient(135deg, ${getRankColor(entry.rank)}15 0%, ${getRankColor(entry.rank)}05 100%)`
                                            : 'white',
                                        top: 0
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.top = '0'}
                                >
                                    <div
                                        style={{
                                            fontSize: entry.rank <= 3 ? '36px' : '18px',
                                            fontWeight: '900',
                                            color: getRankColor(entry.rank),
                                            minWidth: entry.rank <= 3 ? '70px' : '50px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {getRankIcon(entry.rank)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '2px' }}>
                                            {entry.username}
                                        </div>
                                        <div style={{ color: '#999', fontSize: '13px', fontWeight: '600' }}>
                                            {entry.testCount} tests
                                        </div>
                                    </div>
                                    {entry.avgReactionTime !== null && (
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px', fontWeight: '600' }}>
                                                Reaction
                                            </div>
                                            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--duo-blue)' }}>
                                                {entry.avgReactionTime.toFixed(0)}ms
                                            </div>
                                        </div>
                                    )}
                                    {entry.avgAccuracy !== null && (
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px', fontWeight: '600' }}>
                                                Accuracy
                                            </div>
                                            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--duo-green)' }}>
                                                {(entry.avgAccuracy * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Right: Test Type Statistics */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>📊 Test Type Statistics</h3>
                        {testTypes.length > 0 && (
                            <select
                                value={selectedTestType}
                                onChange={(e) => setSelectedTestType(e.target.value)}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    borderRadius: '12px',
                                    border: '2px solid var(--gray-border)',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontFamily: 'Nunito, sans-serif'
                                }}
                            >
                                {testTypes.map((type) => (
                                    <option key={type.type} value={type.type}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {testTypeStats && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Overview Stats */}
                            <div className="test-card" style={{
                                cursor: 'default',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '16px',
                                textAlign: 'center',
                                padding: '20px',
                                top: 0
                            }} onMouseEnter={(e) => e.currentTarget.style.top = '0'}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', fontWeight: '600' }}>Total Tests</div>
                                    <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-color)' }}>
                                        {testTypeStats.totalTests.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', fontWeight: '600' }}>Avg Reaction Time</div>
                                    <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--duo-blue)' }}>
                                        {testTypeStats.avgReactionTime != null ? testTypeStats.avgReactionTime.toFixed(0) : '-'}ms
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', fontWeight: '600' }}>Avg Accuracy</div>
                                    <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--duo-green)' }}>
                                        {testTypeStats.avgAccuracy != null ? (testTypeStats.avgAccuracy * 100).toFixed(0) : '-'}%
                                    </div>
                                </div>
                            </div>

                            {/* Reaction Time Range */}
                            <div className="test-card" style={{ cursor: 'default', padding: '20px', top: 0 }} onMouseEnter={(e) => e.currentTarget.style.top = '0'}>
                                <h4 style={{ margin: 0, marginBottom: '12px', fontSize: '16px' }}>⚡ Reaction Time Range</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Fastest</span>
                                    <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--duo-green)' }}>
                                        {testTypeStats.minReactionTime != null ? testTypeStats.minReactionTime.toFixed(0) : '-'}ms
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Slowest</span>
                                    <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--duo-red)' }}>
                                        {testTypeStats.maxReactionTime != null ? testTypeStats.maxReactionTime.toFixed(0) : '-'}ms
                                    </span>
                                </div>
                            </div>

                            {/* Reaction Time Distribution */}
                            {testTypeStats.reactionTimeDistribution && testTypeStats.reactionTimeDistribution.length > 0 && (
                                <div className="test-card" style={{ cursor: 'default', padding: '20px', top: 0 }} onMouseEnter={(e) => e.currentTarget.style.top = '0'}>
                                    <h4 style={{ margin: 0, marginBottom: '12px', fontSize: '16px' }}>📈 Reaction Time Distribution</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {testTypeStats.reactionTimeDistribution.map((bucket, index) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '700', minWidth: '90px', color: '#666' }}>
                                                    {bucket.range}
                                                </div>
                                                <div style={{ flex: 1, height: '24px', background: '#f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${bucket.percentage}%`,
                                                        background: 'var(--duo-blue)',
                                                        transition: 'width 0.3s'
                                                    }} />
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: '800', minWidth: '60px', textAlign: 'right', color: 'var(--duo-blue)' }}>
                                                    {bucket.percentage.toFixed(1)}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Accuracy Distribution */}
                            {testTypeStats.accuracyDistribution && testTypeStats.accuracyDistribution.length > 0 && (
                                <div className="test-card" style={{ cursor: 'default', padding: '20px', top: 0 }} onMouseEnter={(e) => e.currentTarget.style.top = '0'}>
                                    <h4 style={{ margin: 0, marginBottom: '12px', fontSize: '16px' }}>🎯 Accuracy Distribution</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {testTypeStats.accuracyDistribution.map((bucket, index) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '700', minWidth: '90px', color: '#666' }}>
                                                    {bucket.range}
                                                </div>
                                                <div style={{ flex: 1, height: '24px', background: '#f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${bucket.percentage}%`,
                                                        background: 'var(--duo-green)',
                                                        transition: 'width 0.3s'
                                                    }} />
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: '800', minWidth: '60px', textAlign: 'right', color: 'var(--duo-green)' }}>
                                                    {bucket.percentage.toFixed(1)}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
