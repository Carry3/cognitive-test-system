import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTestTypes } from '../services/testService';
import type { TestType } from '../types/testTypes';

interface GameInfo {
  id: string;
  title: string;
  icon: string;
  desc: string;
  shortDesc: string;
}

// Icon and description mapping for each test type
const GAME_META: Record<string, { icon: string; shortDesc: string; desc: string }> = {
  'SIMPLE_REACTION': {
    icon: "⚡",
    shortDesc: "Press Space when red.",
    desc: "1. Wait for screen to turn <b style='color:red'>RED</b>.<br>2. Press <span class='key-badge'>Space</span> immediately."
  },
  'CHOICE_REACTION': {
    icon: "🔀",
    shortDesc: "Left or Right arrow keys.",
    desc: "Press <span class='key-badge'>←</span> for Left Arrow.<br>Press <span class='key-badge'>→</span> for Right Arrow."
  },
  'GO_NO_GO': {
    icon: "🛑",
    shortDesc: "Press for Green, ignore Red.",
    desc: "If you see <b style='color:#58CC02'>GREEN</b> Circle: Press <span class='key-badge'>Space</span>.<br>If you see <b style='color:red'>RED</b> Square: <b>Do NOT press</b>."
  },
  'WORKING_MEMORY': {
    icon: "🧠",
    shortDesc: "Is this number same as last?",
    desc: "A sequence of numbers will appear.<br>If the <b>current</b> number matches the <b>previous</b> number, press <span class='key-badge'>Space</span>."
  },
  'STROOP': {
    icon: "🔥",
    shortDesc: "Select ink color, ignore word meaning.",
    desc: "A color word will appear (e.g., <span style='color:#0096C7;font-weight:bold'>Red</span>).<br>Press the key for the <b>ink color</b>, not the word meaning:<br><span class='key-badge'>1</span>=Red, <span class='key-badge'>2</span>=Blue, <span class='key-badge'>3</span>=Green, <span class='key-badge'>4</span>=Yellow."
  },
  'CONTINUOUS_ATTENTION': {
    icon: "👁️",
    shortDesc: "Sustained attention test.",
    desc: "Monitor the screen for target stimuli.<br>Press <span class='key-badge'>Space</span> when you see the target."
  }
};

const Dashboard: React.FC = () => {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        const testTypes = await getTestTypes();

        // Map API test types to game cards with icons and descriptions
        const gameCards: GameInfo[] = testTypes.map((test: TestType) => {
          const meta = GAME_META[test.type] || {
            icon: "🎯",
            shortDesc: test.name,
            desc: `Complete the ${test.name} assessment.`
          };

          return {
            id: test.type,
            title: test.name,
            icon: meta.icon,
            shortDesc: meta.shortDesc,
            desc: meta.desc
          };
        });

        setGames(gameCards);
      } catch (error) {
        console.error('Failed to load test types:', error);
        // Fallback to empty array on error
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestTypes();
  }, []);

  const handleStartGame = () => {
    if (selectedGame) {
      navigate(`/test/${selectedGame.id}`);
    }
  };

  if (loading) {
    return (
      <div id="view-dashboard">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="view-dashboard">
      {/* Modal */}
      <div className={`modal-overlay ${selectedGame ? 'active' : ''}`}>
        {selectedGame && (
          <div className="modal-card">
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>{selectedGame.icon}</div>
            <h2 style={{ marginBottom: '10px' }}>{selectedGame.title}</h2>
            <div
              className="inst-desc"
              dangerouslySetInnerHTML={{ __html: selectedGame.desc }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setSelectedGame(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleStartGame}
              >
                Start Game
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Brain Gym</h1>
          <p>All modules below are now <strong>fully implemented</strong> with high-precision timing.</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '20px' }}>Select Assessment</h3>
      <div className="test-grid">
        {games.map(game => (
          <div key={game.id} className="test-card" onClick={() => setSelectedGame(game)}>
            <div style={{ fontSize: '32px' }}>{game.icon}</div>
            <h3>{game.title}</h3>
            <p>{game.shortDesc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
