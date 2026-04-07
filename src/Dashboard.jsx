import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import './Dashboard.css'
import { generateTheologicalInsight } from './lib/anthropicClient'

export default function Dashboard() {
  const [passage, setPassage] = useState('')
  const [theme, setTheme] = useState('')
  const [styleMode, setStyleMode] = useState('Exegetical')
  const [isGenerating, setIsGenerating] = useState(false)
  const [output, setOutput] = useState('')
  const [userEmail, setUserEmail] = useState('Loading...')
  const [userId, setUserId] = useState(null)
  const [history, setHistory] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserEmail(session.user.email)
        setUserId(session.user.id)
        fetchHistory(session.user.id)
      }
    })
  }, [])

  const fetchHistory = async (uid) => {
    const { data, error } = await supabase
      .from('sermon_history')
      .select('id, title, content, style_mode, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setHistory(data);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleExport = async () => {
    if (!output) return;
    
    let title = "Theological Insight";
    const titleMatch = output.match(/title:\s*"?([^"\n]+)"?/);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1];
    } else if (passage) {
      title = `${passage} - ${styleMode}`;
    }
    
    // First try the native OS share menu (Great for Mac/iOS directly to Apple Notes/Bear/etc)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: output,
        });
        return; // If successful, exit
      } catch (err) {
        console.log("Native share was cancelled or failed, falling back to download...");
      }
    }
    
    // Universal Fallback: Download a perfectly formatted .md file which can be opened by ANY note app.
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setIsGenerating(true)
    
    // Call the AI Service
    const result = await generateTheologicalInsight(passage, theme, styleMode)
    setOutput(result)
    
    // Save to history automatically
    let title = "Theological Insight";
    const titleMatch = result.match(/title:\s*"?([^"\n]+)"?/);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1];
    } else if (passage) {
      title = `${passage} - ${styleMode}`;
    }

    if (userId) {
      const { data, error } = await supabase
        .from('sermon_history')
        .insert([{
          user_id: userId,
          title: title,
          content: result,
          style_mode: styleMode
        }])
        .select()
        
      if (!error && data) {
         setHistory(prev => [data[0], ...prev])
      } else {
         console.error("Error saving history:", error)
      }
    }
    
    setIsGenerating(false)
  }

  return (
    <div className="app-container">
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
        <div className="bg-glow-3"></div>
      </div>
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container animate-fade-in">
          <div className="logo-icon">S</div>
          <div className="logo-text">Sermon<span style={{color: 'var(--accent-neon-indigo)', fontWeight: '800'}}>Forge</span></div>
        </div>
        
        <nav className="nav-menu">
          <a href="#" className="nav-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </a>
          <a href="#" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            Research Projects
          </a>
          
          <div style={{ paddingLeft: '44px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px', marginBottom: '16px', maxHeight: '30vh', overflowY: 'auto' }}>
            {history.map(item => (
               <a 
                 key={item.id} 
                 href="#" 
                 onClick={(e) => { e.preventDefault(); setOutput(item.content); setStyleMode(item.style_mode || 'Exegetical'); }}
                 style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
               >
                 {item.title}
               </a>
            ))}
            {history.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No projects yet</span>}
          </div>

          <a href="#" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
            AI Analysis
          </a>
          <a href="#" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Semantic Search
          </a>
          <a href="#" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Library
          </a>
        </nav>
        
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-title" style={{ opacity: 0 }}>SermonForge</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 16px 6px 6px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {userEmail !== 'Loading...' && userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
               </div>
               <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{userEmail.split('@')[0]}</span>
            </div>
            
            <button onClick={handleSignOut} title="Sign Out" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)' }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </header>

        <div className="workspace animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <section className="hero-section">
            <h1 className="hero-title">Research <span className="text-gradient-neon">Insights.</span></h1>
            <p className="hero-subtitle">Synthesize theological concepts, map semantic relationships, and generate structured output for your Obsidian Vault.</p>
          </section>

          <div className="grid-layout">
            {/* Input Form */}
            <form className="glass-panel input-panel" onSubmit={handleGenerate}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600 }}>
                   AI Theological Assistant
                 </h3>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-neon-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
               </div>
              
              <div className="form-group">
                <label className="form-label">Search Scripture, Texts, Concepts...</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Synthesize Patristic views on the Incarnation..."
                  value={passage}
                  onChange={(e) => setPassage(e.target.value)}
                  required
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'18\' height=\'18\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,0.4)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'8\'%3E%3C/circle%3E%3Cline x1=\'21\' y1=\'21\' x2=\'16.65\' y2=\'16.65\'%3E%3C/line%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '16px center', paddingLeft: '44px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prompt Context & Constraints</label>
                <textarea 
                  className="form-input form-textarea" 
                  placeholder="Paste raw notes, specify theologians to reference, or detail formatting requirements..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                ></textarea>
              </div>

              <div>
                 <label className="form-label" style={{ marginBottom: '12px' }}>Output Processing Style</label>
                 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Scholarly', 'Exegetical', 'Synthesis', 'Homiletic', 'Historical'].map(mode => (
                       <div 
                         key={mode} 
                         className={`chip ${styleMode === mode ? 'selected' : ''}`}
                         onClick={() => setStyleMode(mode)}
                       >
                          {mode}
                       </div>
                    ))}
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" className="action-btn secondary" style={{ flex: 1, justifyContent: 'center' }}>
                   Refine Query
                </button>
                <button type="submit" className={`action-btn ${isGenerating ? 'animate-pulse' : ''}`} disabled={isGenerating} style={{ flex: 2, justifyContent: 'center' }}>
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      Generate Insight
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Sidebar Context */}
            <div className="side-panel">
              {output ? (
                /* AI Output Render Pane */
                <div className="glass-panel vault-stats ai-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                     <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--accent-neon-indigo)' }}>
                        Generated Output
                     </h3>
                     <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="chip" onClick={() => navigator.clipboard.writeText(output)}>Copy Text</button>
                        <button className="chip" style={{ background: 'var(--accent-neon-purple)', color: 'white', border: 'none' }} onClick={handleExport}>Save / Export App</button>
                     </div>
                  </div>
                  <div style={{ 
                     background: 'rgba(0,0,0,0.4)', 
                     borderRadius: '12px', 
                     padding: '20px', 
                     flex: 1, 
                     border: '1px solid rgba(255,255,255,0.05)',
                     color: 'var(--text-secondary)',
                     fontSize: '0.9rem',
                     whiteSpace: 'pre-wrap',
                     overflowY: 'auto'
                  }}>
                    {output}
                  </div>
                </div>
              ) : (
                /* Default Sidepane */
                <>
                  <div className="glass-panel vault-stats ai-card">
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-neon-cyan)', boxShadow: '0 0 10px var(--accent-neon-cyan)' }}></div>
                       Ancient Texts Analysis
                    </h3>
                    
                    <div style={{ width: '100%', height: '160px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                       {/* Mock graph visualization */}
                       <svg width="200" height="120" style={{ opacity: 0.7 }}>
                          <circle cx="100" cy="60" r="40" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" fill="none" />
                          <circle cx="100" cy="60" r="30" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                          
                          <circle cx="100" cy="60" r="4" fill="var(--accent-neon-indigo)" />
                          
                          <line x1="100" y1="60" x2="50" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          <circle cx="50" cy="30" r="3" fill="var(--accent-neon-cyan)" />
                          
                          <line x1="100" y1="60" x2="160" y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          <circle cx="160" cy="40" r="3" fill="var(--accent-neon-purple)" />
                          
                          <line x1="100" y1="60" x2="130" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          <circle cx="130" cy="100" r="3" fill="var(--accent-neon-indigo)" />
                          
                          <line x1="100" y1="60" x2="60" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          <circle cx="60" cy="90" r="3" fill="var(--accent-neon-cyan)" />
                       </svg>
                       <div style={{ position: 'absolute', bottom: '12px', left: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Semantic Exploration Map</div>
                    </div>
                  </div>

                  <div className="glass-panel vault-stats" style={{ background: 'rgba(99, 102, 241, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                       <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-neon-indigo)' }}>Workspace Integrations</h3>
                       <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Connected</span>
                    </div>
                    
                    <div className="stat-row">
                      <span style={{ color: 'var(--text-secondary)' }}>Target Vault:</span>
                      <span style={{ fontWeight: 500, color: '#fff' }}>The Well</span>
                    </div>
                    <div className="stat-row">
                      <span style={{ color: 'var(--text-secondary)' }}>Frontmatter Sync:</span>
                      <span style={{ fontWeight: 500, color: '#fff' }}>Enabled</span>
                    </div>
                    <div className="stat-row">
                      <span style={{ color: 'var(--text-secondary)' }}>Auto-Tags:</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Opt-in per gen</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}


