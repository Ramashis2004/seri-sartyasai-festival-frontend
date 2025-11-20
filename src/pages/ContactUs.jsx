import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendContact } from "../api/publicApi";

export default function ContactUs() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return setStatus("Please fill in all fields.");
    setStatus("");
    setLoading(true);
    try {
      await sendContact({ name, email, subject, message });
      setStatus("Message sent successfully.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to send message";
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="contact-page">
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

      <main className="contact-wrap">
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-sub">Have questions? We're here to help!</p>

        <div className="contact-grid">
          <section className="contact-card">
            <h3>Get in Touch</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="input" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input className="input" placeholder="What is this about?" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea className="input" rows={6} placeholder="Your message..." value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
              </div>
              {status && (
                <div style={{ marginBottom: 12, color: status.includes("successfully") ? '#166534' : '#7f1d1d' }}>{status}</div>
              )}
              <button className="btn primary full" style={{ background: '#22c55e', color: '#fff' }} disabled={loading}>{loading ? "Sending..." : "Send Message"}</button>
            </form>
          </section>

          <div className="contact-right">
            <section className="contact-info-card">
              <h4>Office Address</h4>
              <p>Festival of Joy Organization<br/>123 Main Street<br/>City, State 12345<br/>India</p>
            </section>

            <section className="contact-info-card">
              <h4>Contact Information</h4>
              <p><strong>Phone:</strong> +91 1234567890</p>
              <p><strong>Email:</strong> info@festivalofjoy.org</p>
              <p><strong>Office Hours:</strong> Mon-Fri, 9:00 AM - 5:00 PM</p>
            </section>

            <section className="contact-info-card">
              <h4>Support</h4>
              <p>For technical support or registration issues:</p>
              <p><strong>Email:</strong> support@festivalofjoy.org</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
