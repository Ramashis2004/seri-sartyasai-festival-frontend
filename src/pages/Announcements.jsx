import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicAnnouncements } from "../api/publicApi";

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPublicAnnouncements();
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load announcements");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const list = { display: 'flex', flexDirection: 'column', gap: 12 };

  return (
    <div>
      <div className="top-bar">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
          <Link to="/" style={{ fontWeight: 700, color: '#2f855a', textDecoration: 'none', fontSize: 18 }}>Festival of Joy</Link>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 60 }}
            aria-label="Toggle menu"
          >
            <span style={{ width: 24, height: 3, background: '#2f855a', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }}></span>
            <span style={{ width: 24, height: 3, background: '#2f855a', display: 'block', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }}></span>
            <span style={{ width: 24, height: 3, background: '#2f855a', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }}></span>
          </button>

          <nav style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 280, background: '#ffffff', boxShadow: '-4px 0 12px rgba(0,0,0,0.15)', transform: menuOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease', zIndex: 50, display: 'flex', flexDirection: 'column', padding: '80px 24px 24px', gap: 8 }}>
            <Link to="/events" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Events</Link>
            <Link to="/register" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Registration</Link>
            <Link to="/gallery" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Gallery</Link>
            <Link to="/announcements" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Announcements</Link>
            <Link to="/guidelines" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Guidelines</Link>
            <Link to="/contact" className="link" style={{ padding: '12px 16px', color: '#111827', textDecoration: 'none', fontWeight: 600, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#f1f5f9'} onMouseLeave={e => e.target.style.background = 'transparent'}>Contact Us</Link>
            <Link to="/login" style={{ marginTop: 16, padding: '12px 16px', background: '#16a34a', color: '#fff', textDecoration: 'none', fontWeight: 600, borderRadius: 8, textAlign: 'center' }}>User Login</Link>
          </nav>

          {menuOpen && (
            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
          )}
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        <h2 style={{ margin: '0 0 4px 0' }}>Announcements</h2>
        <div style={{ color: '#6b7280', marginBottom: 16 }}>Stay updated with the latest news and announcements</div>
        {loading && <div className="card">Loading announcements...</div>}
        {error && <div className="card" style={{ color: '#b91c1c', background: '#fff7f7' }}>{error}</div>}
        {!loading && !error && (
          <div style={list}>
            {items.length === 0 && (
              <div className="card">No announcements at the moment.</div>
            )}
            {items.map((a, i) => (
              <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{a.title}</div>
                  <div style={{ color: '#374151', marginBottom: 8, maxWidth: '70ch', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{a.message}</div>
                  {/* <Link to="#" style={{ fontSize: 12, color: '#065f46', textDecoration: 'none' }}>Read more →</Link> */}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
