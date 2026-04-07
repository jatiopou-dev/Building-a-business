import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import './LandingPage.css'; // Reusing landing page styles for consistency

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="landing-container">
      <div className="bg-glow-container">
        <div className="bg-glow-1" style={{ top: '-10%', right: '10%' }}></div>
        <div className="bg-glow-3" style={{ bottom: '10%', left: '-5%' }}></div>
      </div>

      <nav className="landing-nav animate-fade-in">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="landing-logo">
            <div className="logo-badge">S</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'white' }}>
              Sermon<span style={{ color: 'var(--accent-neon-indigo)' }}>Forge</span>
            </span>
          </div>
        </Link>
      </nav>

      <main className="hero-wrapper animate-fade-in" style={{ animationDelay: '0.1s', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 className="landing-title" style={{ fontSize: '3rem', marginBottom: '16px' }}>
          Welcome <span className="text-gradient-neon">Back</span>
        </h1>
        
        <p className="landing-subtitle" style={{ maxWidth: '400px', margin: '0 auto 32px' }}>
          Securely access your theological vault and AI assistant.
        </p>
        
        <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', margin: '0 auto', padding: '32px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errorMsg && (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
              <input 
                type="email" 
                className="waitlist-input" 
                placeholder="pastor@church.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
              <input 
                type="password" 
                className="waitlist-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            
            <button type="submit" className="waitlist-button" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
      
      <footer className="footer" style={{ position: 'absolute', bottom: '24px', width: '100%', textAlign: 'center' }}>
        © 2026 SermonForge. Built with vision.
      </footer>
    </div>
  );
}
