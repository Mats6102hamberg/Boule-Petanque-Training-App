import React, { useState, useCallback } from 'react';
import { dataService } from './firebase';
import './App.css';

/* ─── Features ─── */
const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Driven Analys',
    description: 'Realtidsanalys av kastteknik med TensorFlow och OpenCV. Mät noggrannhet, hastighet och teknik automatiskt.',
  },
  {
    icon: '📐',
    title: 'Triangulering',
    description: 'Exakta avståndsmätningar med ARKit/ARCore och LiDAR. Precision inom 1cm!',
  },
  {
    icon: '🎮',
    title: 'Gamification',
    description: 'Dagliga utmaningar, achievements och level-system. Håll motivationen uppe med streak tracking!',
  },
  {
    icon: '📱',
    title: 'AR Enhancements',
    description: 'Virtual trajectory overlay, distance measurements och ground plane detection i AR.',
  },
  {
    icon: '🎬',
    title: 'Video Replay',
    description: 'Slow-motion replay (0.25x–2x) med analys-overlay. Dela till social media!',
  },
  {
    icon: '♿',
    title: 'Accessibility',
    description: 'Röstkommandon, text-to-speech, färgblind-lägen och skärmläsare-stöd.',
  },
];

/* ─── Throw types ─── */
const THROW_TYPES = [
  { id: 'pointing', label: 'Pointing', icon: '🎯', description: 'Placera boulen nära cochonnet' },
  { id: 'shooting', label: 'Shooting', icon: '💥', description: 'Slå bort motståndarens boule' },
  { id: 'rolling', label: 'Rolling', icon: '🎱', description: 'Rulla boulen längs marken' },
  { id: 'lob', label: 'Lob', icon: '🌈', description: 'Högt kast med mjuk landning' },
];

function App() {
  const [showDemo, setShowDemo] = useState(false);
  const [stats, setStats] = useState(dataService.getStats());
  const [achievements, setAchievements] = useState(dataService.getAchievements());
  const [challenges, setChallenges] = useState(dataService.getDailyChallenges());

  // Training state
  const [isTraining, setIsTraining] = useState(false);
  const [currentThrowType, setCurrentThrowType] = useState(null);
  const [throwResult, setThrowResult] = useState(null);
  const [sessionThrows, setSessionThrows] = useState([]);

  // Notification
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

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

  const simulateThrow = () => {
    if (!currentThrowType) return;
    const accuracy = Math.floor(Math.random() * 40) + 60;
    const distance = (Math.random() * 2).toFixed(2);
    const speed = (Math.random() * 15 + 5).toFixed(1);
    const result = { type: currentThrowType, accuracy, distance: parseFloat(distance), speed: parseFloat(speed), time: new Date().toLocaleTimeString() };
    setThrowResult(result);
    setSessionThrows(prev => [...prev, result]);

    let newStats = { ...stats };
    newStats.totalThrows += 1;
    const allThrows = [...sessionThrows, result];
    newStats.accuracy = Math.round(allThrows.reduce((s, t) => s + t.accuracy, 0) / allThrows.length);
    newStats = updateStreak(newStats);
    newStats = checkAchievements(newStats);
    setStats(newStats);
    dataService.saveStats(newStats);

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
      setShowDemo(false);
      return;
    }
    const avg = Math.round(sessionThrows.reduce((s, t) => s + t.accuracy, 0) / sessionThrows.length);
    const session = { throws: sessionThrows.length, accuracy: avg, type: currentThrowType };
    dataService.addSession(session);

    let newStats = { ...stats, totalSessions: stats.totalSessions + 1 };
    newStats = checkAchievements(newStats);
    setStats(newStats);
    dataService.saveStats(newStats);

    showNotification(`Träningspass sparat! ${sessionThrows.length} kast, ${avg}% snitt`);
    setSessionThrows([]);
    setThrowResult(null);
    setIsTraining(false);
    setCurrentThrowType(null);
    setShowDemo(false);
  };

  /* ─── Demo Panel ─── */
  const renderDemo = () => (
    <div className="demo-panel">
      <div className="demo-header">
        <h2>Interaktiv Demo</h2>
        <button className="demo-close" onClick={() => { setShowDemo(false); setIsTraining(false); setSessionThrows([]); setThrowResult(null); setCurrentThrowType(null); }}>
          Tillbaka
        </button>
      </div>

      {/* Stats */}
      <div className="demo-stats">
        <div className="demo-stat">
          <span className="demo-stat-val">{stats.accuracy}%</span>
          <span className="demo-stat-lbl">Noggrannhet</span>
        </div>
        <div className="demo-stat">
          <span className="demo-stat-val">{stats.totalThrows}</span>
          <span className="demo-stat-lbl">Kast</span>
        </div>
        <div className="demo-stat">
          <span className="demo-stat-val">Lv {stats.level}</span>
          <span className="demo-stat-lbl">Level</span>
        </div>
        {stats.streak > 0 && (
          <div className="demo-stat streak">
            <span className="demo-stat-val">{stats.streak}</span>
            <span className="demo-stat-lbl">Streak</span>
          </div>
        )}
      </div>

      {!isTraining ? (
        <>
          <h3 className="demo-subtitle">Välj kasttyp</h3>
          <div className="throw-grid">
            {THROW_TYPES.map(t => (
              <button
                key={t.id}
                className={`throw-card ${currentThrowType === t.id ? 'selected' : ''}`}
                onClick={() => setCurrentThrowType(t.id)}
              >
                <span className="throw-icon">{t.icon}</span>
                <span className="throw-label">{t.label}</span>
              </button>
            ))}
          </div>
          <button
            className="btn-start"
            disabled={!currentThrowType}
            onClick={() => { setIsTraining(true); setSessionThrows([]); setThrowResult(null); }}
          >
            Starta Träning
          </button>
        </>
      ) : (
        <>
          <div className="training-info">
            <span>Tränar: {THROW_TYPES.find(t => t.id === currentThrowType)?.label}</span>
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

          <button className="btn-start" onClick={simulateThrow}>Kasta!</button>

          {sessionThrows.length > 0 && (
            <div className="session-summary">
              <span>Snitt: {Math.round(sessionThrows.reduce((s, t) => s + t.accuracy, 0) / sessionThrows.length)}%</span>
              <span>Bästa: {Math.max(...sessionThrows.map(t => t.accuracy))}%</span>
            </div>
          )}

          <button className="btn-end" onClick={endSession}>Avsluta Pass</button>
        </>
      )}
    </div>
  );

  /* ─── Landing Page ─── */
  return (
    <div className="app">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {showDemo ? renderDemo() : (
        <>
          {/* Hero */}
          <header className="hero">
            <div className="hero-content">
              <span className="hero-icon">🎯</span>
              <h1>Boule P&eacute;tanque Training App</h1>
              <p>AI-Powered Training med AR, Gamification och Accessibility</p>
              <button className="hero-btn" onClick={() => setShowDemo(true)}>
                Prova Demo
              </button>
            </div>
          </header>

          {/* Features */}
          <section className="features">
            <div className="features-grid">
              {FEATURES.map((f, i) => (
                <div className="feature-card" key={i}>
                  <span className="feature-icon">{f.icon}</span>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Demo CTA */}
          <section className="cta">
            <h2>Interaktiv Demo</h2>
            <p>Testa kastteknik, mät noggrannhet och samla achievements direkt i webbläsaren.</p>
            <button className="cta-btn" onClick={() => setShowDemo(true)}>
              Starta Demo
            </button>
          </section>
        </>
      )}
    </div>
  );
}

export default App;
