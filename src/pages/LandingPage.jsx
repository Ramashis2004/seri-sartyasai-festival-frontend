import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const images = ["/images/banner 1.jpg", "/images/banner 2.jpg", "/images/banner 3.jpg"];
  const [index, setIndex] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [annLoad, setAnnLoad] = useState(false);
  const [annErr, setAnnErr] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % images.length), 3000);
    return () => clearInterval(id);
  }, [images.length]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setAnnLoad(true);
        setAnnErr("");
        // Simulating API call - replace with actual getPublicAnnouncements
        const data = [];
        if (!mounted) return;
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setAnnErr("Failed to load announcements");
      } finally {
        if (mounted) setAnnLoad(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="landing-page">
      <div className="top-bar">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
          <Link to="/" style={{ fontWeight: 700, color: '#ffffff', textDecoration: 'none', fontSize: 24}}>Festival of Joy</Link>
          <div style={{ flex: 1 }} />
          
          {/* Hamburger Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              zIndex: 60
            }}
            aria-label="Toggle menu"
          >
            <span style={{ 
              width: 24, 
              height: 3, 
              background: '#ffffff', 
              display: 'block',
              transition: 'all 0.3s',
              transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none'
            }}></span>
            <span style={{ 
              width: 24, 
              height: 3, 
              background: '#ffffff', 
              display: 'block',
              transition: 'all 0.3s',
              opacity: menuOpen ? 0 : 1
            }}></span>
            <span style={{ 
              width: 24, 
              height: 3, 
              background: '#ffffff', 
              display: 'block',
              transition: 'all 0.3s',
              transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'
            }}></span>
          </button>

          {/* Slide-in Menu */}
          <nav style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: 280,
            background: '#88984f',
            boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
            transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            padding: '80px 24px 24px',
            gap: 8
          }}>
            <Link to="/events" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Events</Link>
            <Link to="/register" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Registration</Link>
            <Link to="/gallery" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Gallery</Link>
            <Link to="/announcements" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Announcements</Link>
            <Link to="/guidelines" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Guidelines</Link>
            <Link to="/contact" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Contact Us</Link>
            <Link to="/login" style={{ marginTop: 16, padding: '12px 16px', background: '#16a34a', color: '#fff', textDecoration: 'none', fontWeight: 600, borderRadius: 8, textAlign: 'center' }}>User Login</Link>
          </nav>

          {/* Overlay when menu is open */}
          {menuOpen && (
            <div 
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 40
              }}
            />
          )}
        </div>
      </div>

      <header style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100vh',
        overflow: 'hidden',
        background: '#0b1317',
        top: -65,
      }}>
        {/* Hero Content Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'linear-gradient(to bottom, rgba(11,19,23,0.7) 0%, rgba(11,19,23,0.4) 50%, rgba(11,19,23,0.7) 100%)',
          padding: '0 16px'
        }}>
          <h1 style={{ 
            fontSize: 48, 
            margin: '0 0 12px 0', 
            fontWeight: 700, 
            color: '#ffffff',
            textShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>Festival of Joy</h1>
          <p style={{ 
            margin: '0 0 24px 0', 
            color: '#e5e7eb', 
            fontSize: 18,
            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>Celebrating Unity and Talent</p>
          <div>
            <Link to="/events" style={{
              display: 'inline-block',
              borderRadius: 9999,
              padding: '14px 32px',
              background: '#2f855a',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              boxShadow: '0 8px 20px rgba(47,133,90,0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.target.style.background = '#276749';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.target.style.background = '#2f855a';
              e.target.style.transform = 'translateY(0)';
            }}>View Events</Link>
          </div>
        </div>

        {/* Full-screen Carousel */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}>
          {images.map((src, i) => (
            <img 
              key={src} 
              src={src} 
              alt={`slide ${i + 1}`}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: i === index ? 1 : 0,
                transition: 'opacity 800ms ease-in-out'
              }}
            />
          ))}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 24,
            display: 'flex',
            gap: 10,
            zIndex: 20
          }}>
            {images.map((_, i) => (
              <span 
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
                  boxShadow: i === index ? '0 2px 8px rgba(0,0,0,0.6)' : 'none',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="content-wrap">
        <section className="welcome-section">
          <h2>Welcome to Festival of Joy</h2>
          <p className="lead">A celebration of talent, culture, and unity among Sai Schools and Sai Districts. Join us in this spectacular event where students showcase their skills and creativity.</p>

          <div className="role-cards">
            <div className="role-card">
              <div className="role-icon">📚</div>
              <h3>Register As School</h3>
              <p>Students from Sai Schools compete in various categories and showcase their talents.</p>
              <Link to="/register/school" className="register-link">Register Your School →</Link>
            </div>

            <div className="role-card">
              <div className="role-icon">🖥️</div>
              <h3>Register As IT Admin</h3>
              <p>IT Admins manage participant data, reports and technical operations.</p>
              <Link to="/register/it-admin" className="register-link">Register As IT Admin →</Link>
            </div>

            <div className="role-card">
              <div className="role-icon">🗂️</div>
              <h3>Register As Event Coordinator</h3>
              <p>Coordinate and manage events, evaluate performances, and generate reports.</p>
              <Link to="/register/event-coordinator" className="register-link">Register As Event Coordinator →</Link>
            </div>

            <div className="role-card">
              <div className="role-icon">🏘️</div>
              <h3>Register As District Coordinator</h3>
              <p>Sai Districts participate in district-level competitions and events.</p>
              <Link to="/register/district-coordinator" className="register-link">Register As District Coordinator →</Link>
            </div>

            <div className="role-card">
              <div className="role-icon">⭐</div>
              <h3>Register As Master Admin</h3>
              <p>Master admins oversee the whole festival, manage districts and schools.</p>
              <Link to="/register/master-admin" className="register-link">Register As Master Admin →</Link>
            </div>
          </div>
        </section>

        <section className="cta-gradient">
          <div className="cta-inner">
            <div>
              <h3>Ready to Participate?</h3>
              <p className="small">Register now and be part of this amazing celebration of talent and culture.</p>
            </div>
            <div className="cta-buttons">
              {/* <Link to="/events" className="btn ghost">View Events</Link> */}
              <Link to="/guidelines" className="btn ghost">View Guidelines</Link>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 900, margin: '24px auto 0', padding: '0 16px' }}>
          {/* <h2 style={{ margin: 0, color: '#0f172a' }}>Announcements</h2>
          <p style={{ margin: '4px 0 12px 0', color: '#64748b', fontSize: 14 }}>Stay updated with the latest news and announcements</p>

          {annLoad && <div className="card" style={{ textAlign: 'center' }}>Loading announcements...</div>}
          {annErr && <div className="card" style={{ color: '#b91c1c', background: '#fff7f7' }}>{annErr}</div>} */}

          {!annLoad && !annErr && (
            <div style={{ display: 'grid', gap: 10 }}>
              {(announcements || []).slice(0, 3).map((a, i) => (
                <article key={i} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 14 }}>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ margin: 0, color: '#0f172a', fontSize: 16, fontWeight: 700 }}>{a.title}</h3>
                      <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.message}</p>
                      <Link to="/announcements" style={{ display: 'inline-block', marginTop: 10, fontSize: 13, color: '#16a34a', textDecoration: 'none', background: '#ecfdf5', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: 8 }}>Read more →</Link>
                    </div>
                    <time style={{ marginLeft: 16, color: '#94a3b8', fontSize: 12 }}>
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                    </time>
                  </div>
                </article>
              ))}
              {/* {(!announcements || announcements.length === 0) && (
                <div className="card">No announcements at the moment.</div>
              )} */}
            </div>
          )}
        </section>
      </main>

      <footer className="dems-footer">
        <div style={{ textAlign: 'center' }}>
          <div className="footer-container">
            <div className="footer-logo">
              <img src="/images/SSSBV-1-removebg-preview.png" alt="Logo 1" />
            </div>
            <div className="footer-logo">
              <img src="/images/SSSSO.png" alt="Logo 2" />
            </div>
            <div className="divider"></div>
            <div className="footer-content">
              <a href="mailto:contact@sathyasaibalvikas.org" className="contact-email">
                <span className="email-icon">✉</span>
                <span>contact@sathyasaibalvikas.org</span>
              </a>
              <span className="organization-name">SRI SATHYA SAI SEVA ORGANISATIONS, ODISHA</span>
            </div>
          </div>
        </div>
        <style>{`
          .dems-footer {
            background: linear-gradient(135deg, #f8f4ed 0%, #fdf9f3 100%);
            padding: 1rem  0rem;
            width: 100%;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
          }
          .dems-footer .footer-container {
            display: flex;
            align-items: center;
            justify-content: center;
            max-width: 1400px;
            margin: 0 auto;
            gap: 1.5rem;
          }
          .dems-footer .footer-logo {
            flex-shrink: 0;
          }
          .dems-footer .footer-logo img {
            width: 70px;
            object-fit: contain;
            transition: transform 0.3s ease;
          }
          .dems-footer .footer-logo:hover img {
            transform: scale(1.05);
          }
          .dems-footer .footer-content {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
            text-align: left;
          }
          .dems-footer .social-handle {
            color: #333;
            font-size: 0.95rem;
            font-weight: 600;
          }
          .dems-footer .organization-name {
            color: #333;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .dems-footer .divider {
            width: 1px;
            height: 50px;
            background: #ddd;
            margin: 0 1rem;
          }
          .dems-footer .contact-email {
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: #8b4513;
            font-size: 1.1rem;
            text-decoration: none;
            transition: color 0.3s ease;
          }
          .dems-footer .contact-email:hover {
            color: #d2691e;
          }
          .dems-footer .email-icon {
            font-size: 1.3rem;
          }
          .dems-footer .copyright {
            color: #777;
            font-size: 0.9rem;
            text-align: center;
            margin-top: 1rem;
          }
          @media (max-width: 768px) {
            .dems-footer {
              padding: 1.5rem 1rem;
            }
            .dems-footer .footer-container {
              flex-wrap: wrap;
              gap: 1rem;
            }
            .dems-footer .footer-logo img {
              width: 50px;
              height: 50px;
            }
            .dems-footer .divider {
              display: none;
            }
            .dems-footer .organization-name {
              font-size: 0.75rem;
            }
            .dems-footer .social-handle {
              font-size: 0.85rem;
            }
          }
        `}</style>
      </footer>
    </div>
  );
}