import React, { useState } from "react";
import { Link } from "react-router-dom";

const items = [
  {
  id: 1,
  title: "Event 1",
  desc: "Description of the event",
  img: "/images/event 1.jpg"
}
,
  { id: 2, title: "Event 2", desc: "Description of the event", img: "/images/event 2.jpg" },
{ id: 3, title: "Event 3", desc: "Description of the event", img: "/images/event 3.jpg" },
{ id: 4, title: "Event 4", desc: "Description of the event", img: "/images/event 4.jpg" },
{ id: 5, title: "Event 5", desc: "Description of the event", img: "/images/event 5.jpg" },
{ id: 6, title: "Event 6", desc: "Description of the event", img: "/images/event 6.jpg" },

];

export default function Gallery() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="gallery-page">
      <div className="top-bar">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
          <Link to="/" style={{ fontWeight: 700, color: '#2f855a', textDecoration: 'none', fontSize: 18 }}>Festival of Joy</Link>
          <div style={{ flex: 1 }} />
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
            <span style={{ width: 24, height: 3, background: '#2f855a', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }}></span>
            <span style={{ width: 24, height: 3, background: '#2f855a', display: 'block', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }}></span>
            <span style={{ width: 24, height: 3, background: '#2f855a', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }}></span>
          </button>

          <nav style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: 280,
            background: '#ffffff',
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

          {menuOpen && (
            <div
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
            />
          )}
        </div>
      </div>

      <main className="gallery-wrap">
        <h2 className="gallery-title">Gallery</h2>
        <p className="gallery-sub">View photos and videos from previous Festival of Joy events</p>

        <div className="gallery-grid">
          {items.map(it => (
            <div key={it.id} className="gallery-card">
              <div className="gallery-thumb">
                <img src={it.img} alt={it.title} />
              </div>
              <div className="gallery-meta">
                <div className="g-title">{it.title}</div>
                <div className="g-desc">{it.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
