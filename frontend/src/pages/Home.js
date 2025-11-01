import React, { useState, useEffect } from 'react';
import { Linkedin, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Header shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fade-in on view
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHow = () => {
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="logo">MentraFlow</Link>
        <nav className="nav">
          <a href="#hero" className="nav-link">Home</a>
          <Link to="/science" className="nav-link">Science</Link>
          <Link to="/vision" className="nav-link">Vision</Link>
          <Link to="/pricing" className="nav-link">Pricing</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/login" className="btn-login">Login</Link>
        </nav>
      </header>

      {/* Hero */}
      <section id="hero" className="hero-section">
        <div className="hero-bg">
          <div className="neural-node"></div>
          <div className="neural-node"></div>
          <div className="neural-node"></div>
          <div className="neural-node"></div>
          <div className="neural-node"></div>
        </div>
        <div className="hero-content">
          <h1>Don't just learn — retain what matters.</h1>
          <p>
            You highlight an idea. You promise to revisit it.<br />
            But it fades. MentraFlow brings that aha moment back — right when it's about to fade.
          </p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={scrollToContact}>
              Experience the Demo
            </button>
            <button className="btn-secondary" onClick={scrollToHow}>
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="section problem-section">
        <div className="fade-in">
          <h2 className="section-title">Most of what we learn fades within days.</h2>
          <p className="section-subtitle">
            Our survey of 100+ learners showed that 74% revisit their notes only once — and forget the rest.
          </p>
        </div>
        <div className="stats-grid fade-in">
          <div className="stat-card">
            <h3>43%</h3>
            <p>still rely on handwritten notes</p>
          </div>
          <div className="stat-card">
            <h3>9 of 10</h3>
            <p>said re-reading doesn't help</p>
          </div>
          <div className="stat-card">
            <h3>82%</h3>
            <p>wished their learning could 'stay with them'</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="section how-section">
        <div className="fade-in">
          <h2 className="section-title">Your memory, re-engineered.</h2>
          <p className="section-subtitle">
            MentraFlow follows your brain's rhythm — recall, reflect, rest.
          </p>
        </div>
        <div className="steps-grid fade-in">
          <div className="step-card">
            <div className="step-icon">1</div>
            <h3>Capture</h3>
            <p>Connect notes, chats, or PDFs.</p>
            <p className="step-science">Spacing Effect: reinforce before forgetting.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">2</div>
            <h3>Recall</h3>
            <p>AI surfaces what's fading.</p>
            <p className="step-science">Active Recall: retrieve → strengthen → remember.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">3</div>
            <h3>Retain</h3>
            <p>Each interaction strengthens memory.</p>
            <p className="step-science">Neuroplasticity: build stronger neural links.</p>
          </div>
        </div>
      </section>

      {/* Visualization Section */}
      <section id="visualization" className="section viz-section">
        <div className="fade-in">
          <h2 className="section-title">From scattered thoughts to structured recall.</h2>
          <p className="section-subtitle">
            See your understanding strengthen — one recall at a time.
          </p>
        </div>
        <div className="viz-container fade-in">
          <div className="viz-card before">
            <h3>Before</h3>
            <p>Gray scattered notes. Ideas drift away, connections fade.</p>
          </div>
          <div className="viz-card during">
            <h3>With MentraFlow</h3>
            <p>Connected graph. Knowledge starts linking together.</p>
          </div>
          <div className="viz-card after">
            <h3>After</h3>
            <p>Green-lit memory network. Everything stays, strengthens, grows.</p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="section vision-section">
        <div className="fade-in">
          <h2 className="section-title">Information doubles every year — our memory hasn't evolved.</h2>
          <p className="section-subtitle">
            MentraFlow pioneers adaptive memory infrastructure — where AI helps you learn once and remember forever.
            Whether you're a student, a founder, or a lifelong learner — MentraFlow is built for minds that never stop growing.
          </p>
        </div>
        <div className="timeline fade-in">
          <div className="timeline-item">Learn</div>
          <span className="timeline-arrow">→</span>
          <div className="timeline-item">Forget</div>
          <span className="timeline-arrow">→</span>
          <div className="timeline-item">Reinforce</div>
          <span className="timeline-arrow">→</span>
          <div className="timeline-item">Retain</div>
        </div>
        <p className="vision-caption fade-in">
          Inspired by Stanford, MIT, and Ebbinghaus' Forgetting Curve.
        </p>
      </section>

      {/* Founder Section */}
      <section className="founder-section">
        <div className="founder-quote fade-in">
          <blockquote>
            "We built MentraFlow because we were tired of losing the ideas that shaped us."
          </blockquote>
          <p>Our goal is simple — make forgetting optional.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-section">
        <div className="fade-in">
          <h2 className="section-title">Interested in trying MentraFlow?</h2>
          <p className="section-subtitle">Let's start with a conversation.</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Access Demo
          </button>
          <br />
          <a href="mailto:hello@mentraflow.com" className="contact-email">
            hello@mentraflow.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#hero" className="footer-link">Home</a>
            <Link to="/science" className="footer-link">Science</Link>
            <Link to="/vision" className="footer-link">Vision</Link>
            <Link to="/pricing" className="footer-link">Pricing</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
          </div>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" className="social-link" aria-label="YouTube">
              <Youtube size={20} />
            </a>
          </div>
          <p className="footer-tagline">
            Because knowledge isn't stored — it's strengthened.
          </p>
        </div>
      </footer>

      {/* Demo Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h2>Demo Access Coming Soon</h2>
            <p>
              We're putting the finishing touches on MentraFlow's demo experience.
              Join our early access list and be the first to experience memory infrastructure that actually works.
            </p>
            <button className="btn-primary" onClick={() => setShowModal(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;