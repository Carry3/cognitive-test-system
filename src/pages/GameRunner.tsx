import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { SimpleReaction } from '../components/game/SimpleReaction';
import { ChoiceReaction } from '../components/game/ChoiceReaction';
import { GoNoGo } from '../components/game/GoNoGo';
import { NBack } from '../components/game/NBack';
import { Stroop } from '../components/game/Stroop';
import type { GameResult, GameProps } from '../types/game';
import { startTest, completeTest } from '../services/testService';
import type { TestRound } from '../types/testTypes';

// --- Main Runner ---
const GameRunner: React.FC = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ count: 0, score: 0 });
  const [title, setTitle] = useState("");
  const [apiTestId, setApiTestId] = useState<number | null>(null);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Refs to prevent duplicate API calls and submissions
  const initialized = useRef(false);
  const isSubmitting = useRef(false);

  // Check if we have an existing test ID from navigation state (resuming test)
  const existingTestId = location.state?.existingTestId as number | undefined;

  // Call start test API when component mounts (only if no existing test)
  useEffect(() => {
    const initTest = async () => {
      // Guard against double invocation in StrictMode
      if (initialized.current) return;
      if (!testId) return;

      // Set initialized flag BEFORE async operation to prevent race condition
      initialized.current = true;

      // If we have an existing test ID, use it instead of creating new test
      if (existingTestId) {
        setApiTestId(existingTestId);
        setTestStartTime(Date.now());
        return;
      }

      try {
        const response = await startTest(testId);
        setApiTestId(response.testId);
        setTestStartTime(Date.now());
      } catch (error) {
        console.error('Failed to start test:', error);
        // Reset flag on error to allow retry
        initialized.current = false;
      }
    };

    initTest();
  }, [testId, existingTestId]);

  // Warn user before leaving page if test is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (apiTestId && !isSaving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [apiTestId, isSaving]);

  const handleFinish = useCallback(async (result: GameResult) => {
    // Prevent multiple submissions
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    // Show saving state
    setIsSaving(true);

    // Calculate total time
    const totalTimeMs = Date.now() - testStartTime;

    // Convert GameResult to API format
    const rounds: TestRound[] = result.trials.map(trial => ({
      trialNumber: trial.trialNumber,
      stimulus: trial.metadata?.expectedKey || 'UNKNOWN',
      response: trial.metadata?.actualKey || (trial.correct ? 'CORRECT' : 'INCORRECT'),
      reactionTime: trial.reactionTime || 0,
      isCorrect: trial.correct
    }));

    const totalTrials = result.trials.length;
    const correctTrials = result.trials.filter(t => t.correct).length;

    // Call complete test API if we have a test ID
    if (apiTestId) {
      try {
        const completeResponse = await completeTest(apiTestId, {
          totalTimeMs,
          totalTrials,
          correctTrials,
          rounds
        });

        console.log('Test completed:', completeResponse);

        // Navigate to specific test results page
        navigate(`/results/${apiTestId}`);
      } catch (error) {
        console.error('Failed to complete test:', error);
        // Navigate to results anyway with local data
        navigate('/results', { state: { result, testId } });
      } finally {
        setIsSaving(false);
      }
    } else {
      // No API test ID, just navigate with local results
      setIsSaving(false);
      navigate('/results', { state: { result, testId } });
    }
  }, [apiTestId, testStartTime, navigate, testId]);

  const handleUpdateStats = useCallback((count: number, hits: number) => {
    setStats({ count, score: hits });
  }, []);

  let GameComponent: React.FC<GameProps> | null = null;

  switch (testId) {
    case 'SIMPLE_REACTION':
      GameComponent = SimpleReaction;
      if (!title) setTitle("Simple Reaction");
      break;
    case 'CHOICE_REACTION':
      GameComponent = ChoiceReaction;
      if (!title) setTitle("Choice Reaction");
      break;
    case 'GO_NO_GO':
      GameComponent = GoNoGo;
      if (!title) setTitle("Go / No-Go");
      break;
    case 'WORKING_MEMORY':
      GameComponent = NBack;
      if (!title) setTitle("1-Back Memory");
      break;
    case 'STROOP':
      GameComponent = Stroop;
      if (!title) setTitle("Stroop Test");
      break;
    default:
      return <div>Unknown Test</div>;
  }

  return (
    <div id="view-game" style={{ width: '100%', maxWidth: '800px' }}>
      {/* Saving Overlay */}
      {isSaving && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px 60px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>💾</div>
            <h2 style={{ margin: 0, marginBottom: '10px' }}>Saving...</h2>
            <p style={{ color: '#999', margin: 0 }}>Saving your test results</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Exit</button>
        <h2 id="game-title-display">{title}</h2>
        <div style={{ width: '80px' }}></div>
      </div>

      {GameComponent && (
        <GameComponent
          onFinish={handleFinish}
          onUpdateStats={handleUpdateStats}
        />
      )}

      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#888' }}>
        <span id="trial-count">Trial: {stats.count}</span>
        <span id="score-display">Score: {stats.score}</span>
      </div>
    </div>
  );
};

export default GameRunner;
