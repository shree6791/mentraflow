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

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showModal) setShowModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showModal]);

  const scrollToCta = () => {
    document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
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
            <button className="btn-primary" onClick={scrollToCta}>
              Experience the Demo
            </button>
            <button className="btn-secondary" onClick={scrollToHow}>
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="section problem-section">
        <div className="fade-in">
          <h2 className="section-title">Most of what we learn fades within days.</h2>
          <p className="section-subtitle">
            Our learner survey showed most people revisit notes only once — and forget the rest.
          </p>
        </div>
        <div className="stats-grid fade-in">
          <div className="stat-card">
            <h3>43%</h3>
            <p>still rely on handwritten notes</p>
          </div>
          <div className="stat-card">
            <h3>9 of 10</h3>
            <p>say re-reading doesn't help</p>
          </div>
          <div className="stat-card">
            <h3>82%</h3>
            <p>wish their learning would "stick" longer</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
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

      {/* Visualization */}
      <section id="visualization" className="section viz-section">
        <div className="fade-in">
          <h2 className="section-title">From scattered thoughts to structured recall.</h2>
        </div>
        <div className="viz-container fade-in">
          <div className="viz-card before">
            <h3>Before</h3>
            <p>Gray scattered notes. Ideas drift; connections fade.</p>
          </div>
          <div className="viz-card during">
            <h3>With MentraFlow</h3>
            <p>Connected graph. Knowledge starts linking together.</p>
          </div>
          <div className="viz-card after">
            <h3>After</h3>
            <p>Green-lit memory network. Everything strengthens and stays.</p>
          </div>
        </div>
      </section>

      {/* CTA (Merged Founder + Contact) */}
      <section id="cta" className="section contact-section">
        <div className="fade-in">
          <blockquote className="founder-quote">
            "We built MentraFlow because we were tired of losing the ideas that shaped us."
          </blockquote>
          <p className="section-subtitle">Our goal is simple — make forgetting optional.</p>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/login" className="btn-primary">
              Try MentraFlow
            </Link>
          </div>
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
        <div 
          className="modal-overlay" 
          onClick={() => setShowModal(false)} 
          role="dialog" 
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowModal(false)} 
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 id="modal-title">Demo Access Coming Soon</h2>
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