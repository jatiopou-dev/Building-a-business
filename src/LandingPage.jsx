import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import './LandingPage.css';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      if (supabase) {
        // Insert into Supabase table if configured
        const { error } = await supabase
          .from('waitlist_leads')
          .insert([{ email: email }]);
        
        if (error) console.error("Waitlist Error:", error);
      } else {
        console.info("Supabase is not configured yet. Skipping database insert.");
      }

      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <div className="landing-container">
      {/* Background Orbs */}
      <div className="bg-glow-container">
        <div className="bg-glow-1" style={{ top: '-10%', right: '10%' }}></div>
        <div className="bg-glow-2" style={{ bottom: '10%', left: '-5%' }}></div>
        <div className="bg-glow-3" style={{ top: '50%', left: '50%' }}></div>
      </div>

      <nav className="landing-nav animate-fade-in">
        <div className="landing-logo">
          <div className="logo-badge">S</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>
            Sermon<span style={{ color: 'var(--accent-neon-indigo)' }}>Forge</span>
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/app" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color='white'} onMouseOut={(e) => e.target.style.color='var(--text-secondary)'}>
            Preview App &rarr;
          </Link>
        </div>
      </nav>

      <main className="hero-wrapper animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="badge">
          EARLY ACCESS WAITLIST
        </div>
        
        <h1 className="landing-title">
          The Semantic <span className="text-gradient-neon">Theological</span><br /> Assistant for Pastors.
        </h1>
        
        <p className="landing-subtitle">
          Synthesize complex theology, map semantic relationships, and auto-generate structured Obsidian vault frameworks natively through state-of-the-art AI.
        </p>
        
        {!submitted ? (
          <form className="waitlist-form" onSubmit={handleSubmit}>
            <input 
              type="email" 
              className="waitlist-input" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="waitlist-button">
              Join Waitlist
            </button>
          </form>
        ) : (
          <div className="glass-panel" style={{ padding: '24px', maxWidth: '500px', width: '100%', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
            <h3 style={{ color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
               You're on the list!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>We'll notify you when Early Access opens.</p>
          </div>
        )}

        <div className="mockup-container animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="mockup-image">
            {/* Extremely simple abstracted UI to stand in for a screenshot */}
            <div style={{ width: '100%', height: '100%', display: 'flex', padding: '30px', gap: '30px', opacity: 0.8 }}>
               <div style={{ width: '200px', height: '100%', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--accent-neon-indigo), var(--accent-neon-purple))', borderRadius: '8px', marginBottom: '20px' }}></div>
                  <div style={{ width: '100%', height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}></div>
                  <div style={{ width: '100%', height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}></div>
                  <div style={{ width: '100%', height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}></div>
               </div>
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ width: '30%', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}></div>
                  <div style={{ width: '100%', flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     <div style={{ width: '100%', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
                     <div style={{ width: '100%', flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}></div>
                  </div>
               </div>
            </div>
            
            <div className="mockup-overlay"></div>
          </div>
        </div>
      </main>
      
      <footer className="footer">
        © 2026 SermonForge. Built with vision.
      </footer>
    </div>
  );
}
