import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [firebaseStatus, setFirebaseStatus] = useState('Testar...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Test Firestore
    testFirestore();

    return () => unsubscribe();
  }, []);

  const testFirestore = async () => {
    try {
      // Försök läsa från en collection
      await getDocs(collection(db, 'test'));
      setFirebaseStatus('✅ Firebase är ANSLUTEN!');
    } catch (error) {
      if (error.code === 'permission-denied') {
        setFirebaseStatus('✅ Firebase ansluten (auth behövs för data)');
      } else {
        setFirebaseStatus('❌ Firebase config behöver uppdateras');
        console.error('Firebase error:', error);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          width: '90%'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
            🎯 Boule Pétanque Training
          </h1>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
              🔥 Firebase Status
            </h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {firebaseStatus}
            </p>
          </div>

          {!loading && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
                👤 User Status
              </h2>
              <p style={{ fontSize: '1.1rem' }}>
                {user ? `✅ Inloggad som: ${user.email}` : '⏳ Inte inloggad'}
              </p>
            </div>
          )}

          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'left'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
              📝 Nästa steg:
            </h2>
            <ol style={{ fontSize: '1rem', lineHeight: '1.8' }}>
              <li>Hämta Firebase config från Firebase Console</li>
              <li>Uppdatera <code>src/firebase.js</code></li>
              <li>Ladda om sidan</li>
              <li>Börja bygga! 🚀</li>
            </ol>
          </div>

          <div style={{ marginTop: '30px', fontSize: '0.9rem', opacity: 0.8 }}>
            <p>React Webbapp • Firebase • Tailwind CSS</p>
            <p>Deploy klar på Vercel om ~10 minuter!</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
