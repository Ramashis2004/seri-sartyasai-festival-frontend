import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicEvents, getPublicDistrictEvents } from "../api/publicApi";

export default function Events() {
  const [schoolEvents, setSchoolEvents] = useState([]);
  const [districtEvents, setDistrictEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [schools, districts] = await Promise.all([
          getPublicEvents(),
          getPublicDistrictEvents(),
        ]);
        if (!mounted) return;
        setSchoolEvents(Array.isArray(schools) ? schools : schools?.data || []);
        setDistrictEvents(Array.isArray(districts) ? districts : districts?.data || []);
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load events. Please ensure public endpoints are enabled.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' };
  const listStyle = { display: 'grid', gap: 10 };

  return (
    <div>
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
            <span style={{
              width: 24,
              height: 3,
              background: '#2f855a',
              display: 'block',
              transition: 'all 0.3s',
              transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none'
            }}></span>
            <span style={{
              width: 24,
              height: 3,
              background: '#2f855a',
              display: 'block',
              transition: 'all 0.3s',
              opacity: menuOpen ? 0 : 1
            }}></span>
            <span style={{
              width: 24,
              height: 3,
              background: '#2f855a',
              display: 'block',
              transition: 'all 0.3s',
              transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'
            }}></span>
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

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        <h2 style={{ margin: '4px 0 6px 0', color: '#111827' }}>Events</h2>
        <p style={{ margin: '0 0 14px 0', color: '#6b7280' }}>Browse the list of events available for Schools and Districts.</p>

        {loading && <div className="card" style={{ textAlign: 'center' }}>Loading events...</div>}
        {error && <div className="card" style={{ color: '#b91c1c', background: '#fff7f7' }}>{error}</div>}

        {!loading && !error && (
          <div style={gridStyle}>
            <section>
              <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Events For Schools</h3>
              <div style={listStyle}>
                {schoolEvents.length === 0 && (
                  <div className="card">No school events published yet.</div>
                )}
                {schoolEvents.map((e) => (
                  <div key={e.id} className="card">
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{e.name || e.title}</div>
                    <div style={{ color: '#6b7280', fontSize: 13 }}>{e.description || e.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Events for Districts</h3>
              <div style={listStyle}>
                {districtEvents.length === 0 && (
                  <div className="card">No district events published yet.</div>
                )}
                {districtEvents.map((e) => (
                  <div key={e.id} className="card">
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{e.name || e.title}</div>
                    <div style={{ color: '#6b7280', fontSize: 13 }}>{e.description || e.desc}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
