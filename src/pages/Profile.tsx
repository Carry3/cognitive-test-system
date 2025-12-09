import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTestHistory } from '../services/testService';
import type { TestHistory } from '../types/testTypes';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<TestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('');

  const handleViewResult = (testId: number) => {
    navigate(`/results/${testId}`);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getTestHistory(selectedType || undefined);
        setHistory(data);
      } catch (error) {
        console.error('Failed to load test history:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [selectedType]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div id="view-profile">
        <h2>Profile</h2>
        <div className="hero-section" style={{ background: 'white', color: '#333', border: '2px solid #e5e5e5', boxShadow: 'none' }}>
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div id="view-profile">
      <h2 style={{ marginBottom: '20px' }}>Profile</h2>

      {/* User Info Card */}
      <div className="test-card" style={{ marginBottom: '20px', cursor: 'default' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-color)' }}>User Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-border)' }}>
            <span style={{ color: '#777', fontWeight: '600' }}>Username</span>
            <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{user?.username || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-border)' }}>
            <span style={{ color: '#777', fontWeight: '600' }}>Email</span>
            <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{user?.email || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ color: '#777', fontWeight: '600' }}>Total Tests Completed</span>
            <span style={{ fontWeight: '700', color: 'var(--duo-blue)' }}>{history.filter(h => h.status === 'COMPLETED').length}</span>
          </div>
        </div>
      </div>

      {/* Test History Section */}
      <h3 style={{ marginBottom: '16px' }}>Test History</h3>

      {/* Filter */}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            padding: '10px 16px',
            border: '2px solid var(--gray-border)',
            borderRadius: '12px',
            fontSize: '15px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: '700',
            color: 'var(--text-color)',
            cursor: 'pointer',
            background: 'white'
          }}
        >
          <option value="">All Tests</option>
          <option value="SIMPLE_REACTION">Simple Reaction</option>
          <option value="CHOICE_REACTION">Choice Reaction</option>
          <option value="GO_NO_GO">Go / No-Go</option>
          <option value="WORKING_MEMORY">1-Back Memory</option>
          <option value="STROOP">Stroop Test</option>
        </select>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="test-card" style={{ textAlign: 'center', padding: '40px', cursor: 'default' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ color: '#999', marginBottom: '8px' }}>No Test History</h3>
          <p style={{ color: '#bbb' }}>Complete some tests to see your history here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((test) => (
            <div
              key={test.testId}
              className="test-card"
              style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
              onClick={() => handleViewResult(test.testId)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ marginBottom: '4px', color: 'var(--text-color)' }}>{test.testName}</h3>
                  <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>
                    {formatDate(test.startTime)}
                  </p>
                </div>
                <span style={{
                  background: test.status === 'COMPLETED' ? 'var(--duo-green)' : '#ccc',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '800',
                  textTransform: 'uppercase'
                }}>
                  {test.status}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '16px',
                padding: '16px',
                background: '#f7f7f7',
                borderRadius: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Accuracy</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--duo-blue)' }}>
                    {(test.accuracyRate * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Avg Time</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--duo-green)' }}>
                    {test.avgReactionTime.toFixed(0)}ms
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Duration</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-color)' }}>
                    {formatDuration(test.totalTimeMs)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Rank</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--duo-yellow)' }}>
                    Top {(100 - test.percentileRank).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px', fontSize: '14px', color: '#777' }}>
                {test.correctTrials} / {test.totalTrials} trials completed
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
