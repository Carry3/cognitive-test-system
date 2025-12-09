import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getTestResult } from '../services/testService';
import type { CompleteTestResponse } from '../types/testTypes';
import type { GameResult } from '../types/game';

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId?: string }>();

  const [loading, setLoading] = useState(!!testId);
  const [apiResult, setApiResult] = useState<CompleteTestResponse | null>(null);

  // Get result from navigation state (when coming from game)
  const stateResult = location.state?.result as GameResult | undefined;
  const stateApiResult = location.state?.apiResult as CompleteTestResponse | undefined;

  // Fetch result from API if testId is provided in URL
  useEffect(() => {
    const fetchResult = async () => {
      if (testId) {
        try {
          const data = await getTestResult(parseInt(testId));
          setApiResult(data);
        } catch (error) {
          console.error('Failed to fetch test result:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResult();
  }, [testId]);

  if (loading) {
    return (
      <div id="view-result" style={{ textAlign: 'center', paddingTop: '40px' }}>
        <h2>Loading results...</h2>
      </div>
    );
  }

  // Determine which result to display
  const displayResult = apiResult || stateApiResult;
  const localResult = stateResult;

  // Determine navigation: if coming from test (has stateResult), go to dashboard
  // if coming from history (URL param only), go back
  const isFromTest = !!stateResult;
  const handleBack = () => {
    if (isFromTest) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };
  const backButtonText = isFromTest ? 'Back to Dashboard' : 'Go Back';

  // Calculate display values
  const avgReactionTime = displayResult
    ? displayResult.statistics.avgReactionTime
    : localResult?.avg || 0;

  const accuracy = displayResult
    ? displayResult.statistics.accuracyRate * 100
    : localResult?.accuracy || 0;

  const hasDetailedData = !!displayResult;

  return (
    <div id="view-result" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      {/* Back Button - Top Right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button
          className="btn btn-outline"
          onClick={handleBack}
          style={{ minWidth: '150px' }}
        >
          {backButtonText}
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '80px' }}>🎉</div>
        <h1>Test Complete</h1>

        {displayResult && (
          <div style={{ color: '#999', marginBottom: '20px' }}>
            {displayResult.testName}
          </div>
        )}

        {/* Main Statistics */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', margin: '40px 0' }}>
          <div>
            <div style={{ color: '#999' }}>Avg Response</div>
            <div style={{ fontSize: '40px', color: 'var(--duo-blue)' }} id="res-avg">
              {avgReactionTime.toFixed(0)}ms
            </div>
          </div>
          <div>
            <div style={{ color: '#999' }}>Accuracy</div>
            <div style={{ fontSize: '40px', color: 'var(--duo-green)' }} id="res-acc">
              {accuracy.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Detailed Statistics (if available from API) */}
        {hasDetailedData && displayResult && (
          <>
            {/* Additional Stats Grid */}
            <div className="test-card" style={{
              marginBottom: '20px',
              cursor: 'default',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Total Trials</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-color)' }}>
                  {displayResult.statistics.totalTrials}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Correct</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--duo-green)' }}>
                  {displayResult.statistics.correctTrials}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Fastest</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--duo-blue)' }}>
                  {displayResult.statistics.fastestTime}ms
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Slowest</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--duo-red)' }}>
                  {displayResult.statistics.slowestTime}ms
                </div>
              </div>
            </div>

            {/* Ranking */}
            {displayResult.rank && (
              <div className="test-card" style={{ marginBottom: '20px', cursor: 'default', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏆</div>
                <h3 style={{ color: 'var(--duo-yellow)', marginBottom: '8px' }}>
                  Top {(100 - displayResult.rank.percentile).toFixed(1)}%
                </h3>
                <p style={{ color: '#777', margin: 0 }}>{displayResult.rank.description}</p>
              </div>
            )}

            {/* Brain Regions */}
            {displayResult.brainRegions && displayResult.brainRegions.length > 0 && (
              <div className="test-card" style={{ marginBottom: '20px', cursor: 'default' }}>
                <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Brain Regions Involved</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {displayResult.brainRegions.map((region, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '16px',
                        background: '#f7f7f7',
                        borderRadius: '12px',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ color: 'var(--duo-blue)' }}>{region.regionName}</strong>
                        <span style={{
                          color: 'white',
                          background: 'var(--duo-blue)',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '800'
                        }}>
                          {region.abbreviation}
                        </span>
                      </div>
                      <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>{region.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Results;
