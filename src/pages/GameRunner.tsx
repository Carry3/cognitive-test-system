import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const [stats, setStats] = useState({ count: 0, score: 0 });
  const [title, setTitle] = useState("");
  const [apiTestId, setApiTestId] = useState<number | null>(null);
  const [testStartTime, setTestStartTime] = useState<number>(0);

  // Call start test API when component mounts
  useEffect(() => {
    const initTest = async () => {
      if (!testId) return;

      try {
        const response = await startTest(testId);
        setApiTestId(response.testId);
        setTestStartTime(Date.now());
        console.log('Test started:', response);
      } catch (error) {
        console.error('Failed to start test:', error);
        // Continue anyway to allow offline testing
      }
    };

    initTest();
  }, [testId]);

  const handleFinish = async (result: GameResult) => {
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

        // Navigate to results with API response
        navigate('/results', {
          state: {
            result,
            testId,
            apiResult: completeResponse
          }
        });
      } catch (error) {
        console.error('Failed to complete test:', error);
        // Navigate to results anyway with local data
        navigate('/results', { state: { result, testId } });
      }
    } else {
      // No API test ID, just navigate with local results
      navigate('/results', { state: { result, testId } });
    }
  };

  const handleUpdateStats = (count: number, hits: number) => {
    setStats({ count, score: hits });
  };

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
