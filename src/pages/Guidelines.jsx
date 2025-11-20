import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";

function useTab() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const t = (params.get("tab") || "general").toLowerCase();
  if (["general", "schools", "districts"].includes(t)) return t;
  return "general";
}

export default function Guidelines() {
  const tab = useTab();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="guidelines-page">
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

      <div className="guidelines-wrap">
        <h2 className="guidelines-title">
          {tab === "general" && "General Guidelines"}
          {tab === "schools" && "Events For Schools"}
          {tab === "districts" && "Events for Districts"}
        </h2>

        {/* Simple local nav */}
        <div style={{ display: 'flex', gap: 8, margin: '0 0 14px 0' }}>
          <Link className={`chip ${tab==='general'?'active':''}`} to="/guidelines?tab=general">General</Link>
          <Link className={`chip ${tab==='schools'?'active':''}`} to="/guidelines?tab=schools">Events For Schools</Link>
          <Link className={`chip ${tab==='districts'?'active':''}`} to="/guidelines?tab=districts">Events for Districts</Link>
        </div>

        {tab === "general" && (
          <>
            <section className="guide-card">
              <h4>Registration Process</h4>
              <ul>
                <li>All registrations must be completed online through this portal</li>
                <li>Registration requires admin approval before access is granted</li>
                <li>Ensure all information provided is accurate and up-to-date</li>
                <li>Duplicate registrations will be automatically rejected</li>
              </ul>
            </section>
            <section className="guide-card">
              <h4>Important Dates</h4>
              <ul>
                <li>Registration opens: January 1, 2024</li>
                <li>Registration closes: February 15, 2024</li>
                <li>Participant details can be edited until 48 hours before the event</li>
                <li>Final participant list will be locked 24 hours before event commencement</li>
              </ul>
            </section>
            <section className="guide-card">
              <h4>Code of Conduct</h4>
              <ul>
                <li>All participants must maintain respectful behavior</li>
                <li>Follow the rules and regulations of the event</li>
                <li>Arrive on time for scheduled events</li>
                <li>Respect the decisions of judges and coordinators</li>
              </ul>
            </section>
            <section className="guide-card">
              <h4>Contact Information</h4>
              <p>For any queries regarding the guidelines, please contact:</p>
              <p>Email: guidelines@festivalofjoy.org</p>
              <p>Phone: +91 123-456-7890</p>
            </section>
          </>
        )}

        {tab === "schools" && (
          <>
            <section className="guide-card">
              <h4>Eligibility</h4>
              <ul>
                <li>Open to all Sai Schools registered under a Sai District</li>
                <li>Each school may nominate participants per event as per limits</li>
              </ul>
            </section>
            <section className="guide-card">
              <h4>Submission & Participation</h4>
              <ul>
                <li>Ensure parental consent for all student participants</li>
                <li>Adhere to category rules and time limits for performances</li>
              </ul>
            </section>
            <section className="guide-card">
              <h4>Judging & Awards</h4>
              <ul>
                <li>Evaluation criteria will be published per event</li>
                <li>Certificates will be provided to participants and winners</li>
              </ul>
            </section>
          </>
        )}

        {tab === "districts" && (
          <>
            <section className="guide-card">
              <h4>District Coordination</h4>
              <ul>
                <li>Appoint district coordinators for each event category</li>
                <li>Ensure communication between schools and event committees</li>
              </ul>
            </section>
            <section className="guide-card">
              <h4>Participant Management</h4>
              <ul>
                <li>Verify eligibility and documentation for district-level entries</li>
                <li>Submit finalized rosters before the published deadline</li>
              </ul>
            </section>
            <section className="guide-card">
              <h4>Logistics</h4>
              <ul>
                <li>Arrange travel and accommodation if required</li>
                <li>Provide on-site support during events</li>
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
