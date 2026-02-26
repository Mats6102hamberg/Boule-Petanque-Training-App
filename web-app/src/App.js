import React, { useState, useCallback } from 'react';
import { dataService } from './firebase';
import './App.css';

/* ─── Tabs ─── */
const TABS = [
  { id: 'home', label: 'Hem', icon: '🏠' },
  { id: 'training', label: 'Träning', icon: '🎯' },
  { id: 'game', label: 'Spel', icon: '🏆' },
  { id: 'challenges', label: 'Utmaningar', icon: '🎮' },
  { id: 'achievements', label: 'Achievements', icon: '⭐' },
];

/* ─── Throw types ─── */
const THROW_TYPES = [
  { id: 'pointing', label: 'Pointing', icon: '🎯', description: 'Placera boulen nära cochonnet' },
  { id: 'shooting', label: 'Shooting', icon: '💥', description: 'Slå bort motståndarens boule' },
  { id: 'rolling', label: 'Rolling', icon: '🎱', description: 'Rulla boulen längs marken' },
  { id: 'lob', label: 'Lob', icon: '🌈', description: 'Högt kast med mjuk landning' },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState(dataService.getStats());
  const [achievements, setAchievements] = useState(dataService.getAchievements());
  const [challenges, setChallenges] = useState(dataService.getDailyChallenges());
  const [sessions, setSessions] = useState(dataService.getSessions());
  const [games, setGames] = useState(dataService.getGames());

  // Training state
  const [isTraining, setIsTraining] = useState(false);
  const [currentThrowType, setCurrentThrowType] = useState(null);
  const [throwResult, setThrowResult] = useState(null);
  const [sessionThrows, setSessionThrows] = useState([]);

  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [gameScore, setGameScore] = useState({ player: 0, opponent: 0 });
  const [gameTarget] = useState(13);

  // Notification
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Check achievements
  const checkAchievements = useCallback((newStats) => {
    const updated = [...achievements];
    let gained = false;

    const checks = [
      { id: 'first_throw', condition: newStats.totalThrows >= 1 },
      { id: 'dedicated', condition: newStats.totalSessions >= 10 },
      { id: 'first_win', condition: newStats.wins >= 1 },
      { id: 'week_warrior', condition: newStats.streak >= 7 },
      { id: 'champion', condition: newStats.level >= 10 },
      { id: 'precision_master', condition: newStats.accuracy >= 90 },
      { id: 'century', condition: newStats.totalThrows >= 100 },
    ];

    checks.forEach(({ id, condition }) => {
      const a = updated.find(x => x.id === id);
      if (a && !a.unlocked && condition) {
        a.unlocked = true;
        gained = true;
        showNotification(`Achievement upplåst: ${a.icon} ${a.name} (+${a.points}p)`);
        newStats.points += a.points;
      }
    });

    if (gained) {
      // Level up check
      while (newStats.points >= newStats.pointsToNextLevel) {
        newStats.level += 1;
        newStats.points -= newStats.pointsToNextLevel;
        newStats.pointsToNextLevel = Math.floor(newStats.pointsToNextLevel * 1.3);
        showNotification(`Level Up! Du är nu Level ${newStats.level}`);
      }
      setAchievements(updated);
      dataService.saveAchievements(updated);
    }

    return newStats;
  }, [achievements, showNotification]);

  // Update streak
  const updateStreak = useCallback((currentStats) => {
    const today = new Date().toDateString();
    const last = currentStats.lastTrainingDate;
    if (last === today) return currentStats;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = last === yesterday.toDateString();

    return {
      ...currentStats,
      streak: isConsecutive ? currentStats.streak + 1 : 1,
      lastTrainingDate: today,
    };
  }, []);

  // Simulate throw
  const simulateThrow = () => {
    if (!currentThrowType) return;
    const accuracy = Math.floor(Math.random() * 40) + 60; // 60-100
    const distance = (Math.random() * 2).toFixed(2); // 0-2m from cochonnet
    const speed = (Math.random() * 15 + 5).toFixed(1); // 5-20 km/h
    const result = { type: currentThrowType, accuracy, distance: parseFloat(distance), speed: parseFloat(speed), time: new Date().toLocaleTimeString() };

    setThrowResult(result);
    setSessionThrows(prev => [...prev, result]);

    // Update stats
    let newStats = { ...stats };
    newStats.totalThrows += 1;
    const allThrows = [...sessionThrows, result];
    newStats.accuracy = Math.round(allThrows.reduce((s, t) => s + t.accuracy, 0) / allThrows.length);
    newStats = updateStreak(newStats);
    newStats = checkAchievements(newStats);
    setStats(newStats);
    dataService.saveStats(newStats);

    // Update challenges
    if (accuracy >= 80) {
      const updated = [...challenges];
      const c = updated.find(x => x.id === 'precision');
      if (c && c.progress < c.target) {
        c.progress += 1;
        if (c.progress >= c.target) showNotification(`Utmaning klar: ${c.title} (+${c.reward}p)`);
        setChallenges(updated);
        dataService.saveChallenges(updated);
      }
    }
  };

  const endSession = () => {
    if (sessionThrows.length === 0) {
      setIsTraining(false);
      return;
    }
    const avg = Math.round(sessionThrows.reduce((s, t) => s + t.accuracy, 0) / sessionThrows.length);
    const session = { throws: sessionThrows.length, accuracy: avg, type: currentThrowType };
    const updated = dataService.addSession(session);
    setSessions(updated);

    let newStats = { ...stats, totalSessions: stats.totalSessions + 1 };
    newStats = checkAchievements(newStats);
    setStats(newStats);
    dataService.saveStats(newStats);

    showNotification(`Träningspass sparat! ${sessionThrows.length} kast, ${avg}% snitt`);
    setSessionThrows([]);
    setThrowResult(null);
    setIsTraining(false);
    setCurrentThrowType(null);
  };

  // Game functions
  const addPoint = (who) => {
    const newScore = { ...gameScore, [who]: gameScore[who] + 1 };
    setGameScore(newScore);

    if (newScore.player >= gameTarget || newScore.opponent >= gameTarget) {
      const won = newScore.player >= gameTarget;
      let newStats = { ...stats };
      if (won) newStats.wins += 1;
      newStats = checkAchievements(newStats);
      setStats(newStats);
      dataService.saveStats(newStats);

      const game = { playerScore: newScore.player, opponentScore: newScore.opponent, won };
      const updatedGames = dataService.addGame(game);
      setGames(updatedGames);

      showNotification(won ? 'Grattis! Du vann!' : 'Tyvärr, du förlorade. Nästa gång!', won ? 'success' : 'info');
      setGameActive(false);
      setGameScore({ player: 0, opponent: 0 });
    }
  };

  /* ─── RENDER TABS ─── */

  const renderHome = () => (
    <div className="tab-panel">
      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-value">{stats.accuracy}%</div>
          <div className="stat-label">Noggrannhet</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.totalSessions}</div>
          <div className="stat-label">Träningspass</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.wins}</div>
          <div className="stat-label">Vinster</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.totalThrows}</div>
          <div className="stat-label">Totalt kast</div>
        </div>
      </div>

      {/* Streak */}
      {stats.streak > 0 && (
        <div className="streak-banner">
          <span className="streak-fire">🔥</span>
          <span className="streak-count">{stats.streak}</span>
          <span className="streak-text">dagars streak</span>
        </div>
      )}

      {/* Level */}
      <div className="level-card">
        <div className="level-header">
          <span>⭐ Level {stats.level}</span>
          <span>{stats.points} / {stats.pointsToNextLevel} p</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(stats.points / stats.pointsToNextLevel) * 100}%` }} />
        </div>
      </div>

      {/* Recent sessions */}
      <h3 className="section-title">Senaste träningspass</h3>
      {sessions.length === 0 ? (
        <div className="empty-state">
          <p>Inga träningspass ännu. Starta din första träning!</p>
          <button className="btn-primary" onClick={() => setActiveTab('training')}>Starta Träning</button>
        </div>
      ) : (
        sessions.slice(0, 5).map((s, i) => (
          <div className="card" key={i}>
            <div className="card-row">
              <span className="card-label">{new Date(s.date).toLocaleDateString('sv-SE')}</span>
              <span className="card-badge">{s.throws} kast</span>
            </div>
            <div className="card-row">
              <span>Noggrannhet: {s.accuracy}%</span>
              <span className="card-type">{s.type}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTraining = () => (
    <div className="tab-panel">
      {!isTraining ? (
        <>
          <h3 className="section-title">Välj kasttyp</h3>
          {THROW_TYPES.map(t => (
            <button
              key={t.id}
              className={`throw-type-card ${currentThrowType === t.id ? 'selected' : ''}`}
              onClick={() => setCurrentThrowType(t.id)}
            >
              <span className="throw-icon">{t.icon}</span>
              <div className="throw-info">
                <div className="throw-label">{t.label}</div>
                <div className="throw-desc">{t.description}</div>
              </div>
            </button>
          ))}
          <button
            className="btn-primary"
            disabled={!currentThrowType}
            onClick={() => { setIsTraining(true); setSessionThrows([]); setThrowResult(null); }}
          >
            Starta Träning
          </button>
        </>
      ) : (
        <>
          <div className="training-header">
            <h3>Tränar: {THROW_TYPES.find(t => t.id === currentThrowType)?.label}</h3>
            <span className="throw-count">{sessionThrows.length} kast</span>
          </div>

          {throwResult && (
            <div className="result-card">
              <div className="result-accuracy" style={{ color: throwResult.accuracy >= 80 ? '#2E7D32' : throwResult.accuracy >= 60 ? '#F57C00' : '#D32F2F' }}>
                {throwResult.accuracy}%
              </div>
              <div className="result-details">
                <span>Avstånd: {throwResult.distance}m</span>
                <span>Hastighet: {throwResult.speed} km/h</span>
              </div>
              <div className="result-bar">
                <div className="result-fill" style={{ width: `${throwResult.accuracy}%`, background: throwResult.accuracy >= 80 ? '#2E7D32' : throwResult.accuracy >= 60 ? '#F57C00' : '#D32F2F' }} />
              </div>
            </div>
          )}

          <button className="btn-primary" onClick={simulateThrow}>
            🎯 Kasta!
          </button>

          {sessionThrows.length > 0 && (
            <div className="session-summary">
              <div className="card-row">
                <span>Snitt: {Math.round(sessionThrows.reduce((s, t) => s + t.accuracy, 0) / sessionThrows.length)}%</span>
                <span>Bästa: {Math.max(...sessionThrows.map(t => t.accuracy))}%</span>
              </div>
            </div>
          )}

          <button className="btn-secondary" onClick={endSession}>
            Avsluta Pass
          </button>
        </>
      )}
    </div>
  );

  const renderGame = () => (
    <div className="tab-panel">
      {!gameActive ? (
        <>
          <h3 className="section-title">Nytt Spel</h3>
          <div className="card">
            <p className="card-desc">Spela till {gameTarget} poäng. Registrera poäng efter varje omgång.</p>
            <button className="btn-primary" onClick={() => { setGameActive(true); setGameScore({ player: 0, opponent: 0 }); }}>
              Starta Spel
            </button>
          </div>

          <h3 className="section-title">Spelhistorik</h3>
          {games.length === 0 ? (
            <div className="empty-state"><p>Inga spel ännu.</p></div>
          ) : (
            games.slice(0, 10).map((g, i) => (
              <div className="card" key={i}>
                <div className="card-row">
                  <span>{new Date(g.date).toLocaleDateString('sv-SE')}</span>
                  <span className={g.won ? 'badge-win' : 'badge-loss'}>{g.won ? 'Vinst' : 'Förlust'}</span>
                </div>
                <div className="card-row">
                  <span>Du {g.playerScore} – {g.opponentScore} Motståndare</span>
                </div>
              </div>
            ))
          )}
        </>
      ) : (
        <>
          <div className="scoreboard">
            <div className="score-side">
              <div className="score-label">Du</div>
              <div className="score-number">{gameScore.player}</div>
              <button className="score-btn" onClick={() => addPoint('player')}>+1</button>
              <button className="score-btn small" onClick={() => addPoint('player')}>+2</button>
              <button className="score-btn small" onClick={() => addPoint('player')}>+3</button>
            </div>
            <div className="score-divider">
              <span className="score-vs">VS</span>
              <span className="score-target">Först till {gameTarget}</span>
            </div>
            <div className="score-side">
              <div className="score-label">Motståndare</div>
              <div className="score-number">{gameScore.opponent}</div>
              <button className="score-btn opponent" onClick={() => addPoint('opponent')}>+1</button>
              <button className="score-btn opponent small" onClick={() => addPoint('opponent')}>+2</button>
              <button className="score-btn opponent small" onClick={() => addPoint('opponent')}>+3</button>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => { setGameActive(false); setGameScore({ player: 0, opponent: 0 }); }}>
            Avbryt Spel
          </button>
        </>
      )}
    </div>
  );

  const renderChallenges = () => (
    <div className="tab-panel">
      <div className="streak-banner big">
        <div className="streak-fire">🔥</div>
        <div className="streak-count">{stats.streak}</div>
        <div className="streak-text">Dagars Streak</div>
      </div>

      <h3 className="section-title">Dagens Utmaningar</h3>
      {challenges.map((c, i) => (
        <div className="challenge-card" key={i}>
          <div className="challenge-header">
            <span className="challenge-title">{c.icon} {c.title}</span>
            <span className="challenge-reward">+{c.reward}p</span>
          </div>
          <p className="challenge-desc">{c.description}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(c.progress / c.target) * 100}%` }} />
          </div>
          <div className="challenge-progress">
            {c.progress >= c.target ? <span className="complete">✓ Klar!</span> : <span>{c.progress}/{c.target}</span>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAchievements = () => (
    <div className="tab-panel">
      <div className="level-card big">
        <div className="level-icon">⭐</div>
        <div className="level-num">Level {stats.level}</div>
        <div className="level-points">{stats.points} poäng</div>
        <div className="progress-bar light">
          <div className="progress-fill white" style={{ width: `${(stats.points / stats.pointsToNextLevel) * 100}%` }} />
        </div>
        <div className="level-next">{stats.pointsToNextLevel - stats.points} poäng till Level {stats.level + 1}</div>
      </div>

      <h3 className="section-title">Dina Achievements</h3>
      <div className="achievements-grid">
        {achievements.map((a, i) => (
          <div className={`achievement-card ${!a.unlocked ? 'locked' : ''}`} key={i}>
            <div className="achievement-icon">{a.icon}</div>
            <div className="achievement-name">{a.name}</div>
            <div className="achievement-points">+{a.points}p</div>
            {!a.unlocked && <div className="achievement-req">{a.requirement}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'training': return renderTraining();
      case 'game': return renderGame();
      case 'challenges': return renderChallenges();
      case 'achievements': return renderAchievements();
      default: return renderHome();
    }
  };

  return (
    <div className="app">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <h1>🎯 Boule Pétanque</h1>
        <p>AI-Powered Training App</p>
      </header>

      {/* Nav */}
      <nav className="app-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="app-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
