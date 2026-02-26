import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { dataService } from './firebase';
import './App.css';

/* ─── Theme Hook ─── */
function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('boule_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('boule_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return { theme, toggleTheme };
}

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

/* ─── Landing Page ─── */
function LandingPage() {
  return (
    <>
      <header className="hero">
        <div className="hero-content">
          <span className="hero-icon">🎯</span>
          <h1>Boule P&eacute;tanque Training App</h1>
          <p>AI-Powered Training med AR, Gamification och Accessibility</p>
          <Link to="/train" className="hero-btn">
            Prova Demo
          </Link>
        </div>
      </header>

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

      <section className="cta">
        <h2>Interaktiv Demo</h2>
        <p>Testa kastteknik, mät noggrannhet och samla achievements direkt i webbläsaren.</p>
        <div className="cta-buttons">
          <Link to="/train" className="cta-btn">
            Starta Demo
          </Link>
          <Link to="/history" className="cta-btn cta-btn-secondary">
            Träningshistorik
          </Link>
        </div>
      </section>
    </>
  );
}

/* ─── Training Page ─── */
function TrainingPage({ stats, setStats, achievements, setAchievements, challenges, setChallenges, showNotification }) {
  const navigate = useNavigate();
  const [isTraining, setIsTraining] = useState(false);
  const [currentThrowType, setCurrentThrowType] = useState(null);
  const [throwResult, setThrowResult] = useState(null);
  const [sessionThrows, setSessionThrows] = useState([]);

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
  }, [achievements, setAchievements, showNotification]);

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
      navigate('/');
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
    navigate('/');
  };

  return (
    <div className="demo-panel">
      <div className="demo-header">
        <h2>Interaktiv Demo</h2>
        <Link to="/" className="demo-close" onClick={() => { setIsTraining(false); setSessionThrows([]); setThrowResult(null); setCurrentThrowType(null); }}>
          Tillbaka
        </Link>
      </div>

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
}

/* ─── History Page ─── */
function HistoryPage() {
  const sessions = dataService.getSessions();
  const stats = dataService.getStats();

  // Take last 20 sessions (reversed so oldest first for graph)
  const graphData = sessions.slice(0, 20).reverse();

  const renderGraph = () => {
    if (graphData.length < 2) return null;
    const width = 320;
    const height = 160;
    const padding = { top: 10, right: 10, bottom: 24, left: 36 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const minAcc = Math.max(0, Math.min(...graphData.map(s => s.accuracy)) - 10);
    const maxAcc = Math.min(100, Math.max(...graphData.map(s => s.accuracy)) + 10);
    const range = maxAcc - minAcc || 1;

    const points = graphData.map((s, i) => {
      const x = padding.left + (i / (graphData.length - 1)) * chartW;
      const y = padding.top + chartH - ((s.accuracy - minAcc) / range) * chartH;
      return { x, y, accuracy: s.accuracy };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="history-chart">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#667eea" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padding.top + chartH * (1 - pct);
          const val = Math.round(minAcc + range * pct);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#e0e0e0" strokeWidth="0.5" />
              <text x={padding.left - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#999">{val}%</text>
            </g>
          );
        })}
        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#667eea" stroke="white" strokeWidth="1.5" />
        ))}
      </svg>
    );
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const throwTypeLabel = (type) => {
    const t = THROW_TYPES.find(x => x.id === type);
    return t ? `${t.icon} ${t.label}` : type;
  };

  return (
    <div className="history-page">
      <div className="demo-header">
        <h2>Träningshistorik</h2>
        <Link to="/" className="demo-close">Tillbaka</Link>
      </div>

      {/* Summary stats */}
      <div className="demo-stats">
        <div className="demo-stat">
          <span className="demo-stat-val">{stats.totalSessions}</span>
          <span className="demo-stat-lbl">Pass</span>
        </div>
        <div className="demo-stat">
          <span className="demo-stat-val">{stats.totalThrows}</span>
          <span className="demo-stat-lbl">Kast</span>
        </div>
        <div className="demo-stat">
          <span className="demo-stat-val">{stats.accuracy}%</span>
          <span className="demo-stat-lbl">Snitt</span>
        </div>
        <div className="demo-stat">
          <span className="demo-stat-val">Lv {stats.level}</span>
          <span className="demo-stat-lbl">Level</span>
        </div>
      </div>

      {/* Graph */}
      {graphData.length >= 2 ? (
        <div className="history-graph-card">
          <h3 className="demo-subtitle">Noggrannhet per pass</h3>
          {renderGraph()}
        </div>
      ) : (
        <div className="history-empty">
          <p>Träna minst 2 pass för att se grafen.</p>
        </div>
      )}

      {/* Session list */}
      <h3 className="demo-subtitle" style={{ marginTop: 20 }}>Senaste pass</h3>
      {sessions.length === 0 ? (
        <div className="history-empty">
          <p>Inga träningspass ännu.</p>
          <Link to="/train" className="btn-start" style={{ marginTop: 12 }}>Starta träning</Link>
        </div>
      ) : (
        <div className="session-list">
          {sessions.slice(0, 20).map((s) => (
            <div className="session-item" key={s.id}>
              <div className="session-item-left">
                <span className="session-item-type">{throwTypeLabel(s.type)}</span>
                <span className="session-item-date">{formatDate(s.date)}</span>
              </div>
              <div className="session-item-right">
                <span className="session-item-acc" style={{ color: s.accuracy >= 80 ? '#2E7D32' : s.accuracy >= 60 ? '#F57C00' : '#D32F2F' }}>
                  {s.accuracy}%
                </span>
                <span className="session-item-throws">{s.throws} kast</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── App with Routes ─── */
function App() {
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState(dataService.getStats());
  const [achievements, setAchievements] = useState(dataService.getAchievements());
  const [challenges, setChallenges] = useState(dataService.getDailyChallenges());
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  return (
    <div className="app">
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Växla tema">
        {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
      </button>
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route
          path="/train"
          element={
            <TrainingPage
              stats={stats}
              setStats={setStats}
              achievements={achievements}
              setAchievements={setAchievements}
              challenges={challenges}
              setChallenges={setChallenges}
              showNotification={showNotification}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
