import React, { useState, useEffect } from 'react';
import { Linkedin, Twitter, Youtube, BookOpen, TrendingDown, RefreshCw, Award, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';

const Vision = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="logo">
          MentraFlow
        </Link>
        
        {/* Hamburger Toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/science" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Science</Link>
          <Link to="/vision" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Vision</Link>
          <Link to="/pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          <Link to="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <Link to="/login" className="btn-login" onClick={() => setMobileMenuOpen(false)}>
            Login
          </Link>
        </nav>
      </header>

      {/* Vision Hero Section */}
      <section className="vision-hero">
        <div className="hero-content fade-in">
          <h1>Make forgetting optional.</h1>
          <p>
            Information doubles every year — our memory hasn't evolved.<br />
            We're changing that.
          </p>
        </div>
      </section>

      {/* Narrative Timeline Section */}
      <section className="section narrative-timeline-section">
        <div className="fade-in">
          <h2 className="section-title">The Journey of Knowledge</h2>
          <p className="section-subtitle">
            Every idea follows the same path — but MentraFlow changes the ending.
          </p>
        </div>
        <div className="timeline-container fade-in">
          <div className="timeline-line"></div>
          <div className="timeline-steps">
            <div className="timeline-step">
              <div className="timeline-icon learn-icon">
                <BookOpen size={32} strokeWidth={2} />
              </div>
              <h3>Learn</h3>
              <p>You discover a powerful idea that could change everything.</p>
            </div>

            <div className="timeline-step">
              <div className="timeline-icon forget-icon">
                <TrendingDown size={32} strokeWidth={2} />
              </div>
              <h3>Forget</h3>
              <p>Days pass. The insight fades into the background of daily life.</p>
            </div>

            <div className="timeline-step">
              <div className="timeline-icon reinforce-icon">
                <RefreshCw size={32} strokeWidth={2} />
              </div>
              <h3>Reinforce</h3>
              <p>MentraFlow brings it back — right when your brain needs it most.</p>
            </div>

            <div className="timeline-step">
              <div className="timeline-icon retain-icon">
                <Award size={32} strokeWidth={2} />
              </div>
              <h3>Retain</h3>
              <p>The idea becomes part of you, strengthening with every recall.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Note Section */}
      <section className="founder-vision-section">
        <div className="founder-content fade-in">
          <blockquote>
            "We built MentraFlow because we were tired of losing the ideas that shaped us."
          </blockquote>
          <div className="mission-statement">
            <p>
              Our mission is to build the world's first adaptive memory infrastructure — where AI strengthens human understanding.
            </p>
            <p className="mission-detail">
              Every day, brilliant insights are lost to the forgetting curve. Students forget lectures. Founders lose strategic ideas. Researchers miss connections. MentraFlow doesn't just help you remember — it helps you <strong>think better</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem We're Solving */}
      <section className="section problem-vision-section">
        <div className="fade-in">
          <h2 className="section-title">The World's Information Challenge</h2>
        </div>
        <div className="challenge-grid fade-in">
          <div className="challenge-card">
            <div className="challenge-number">2x</div>
            <h3>Information Doubles</h3>
            <p>Global information doubles every 12 months, yet our memory capacity hasn't changed.</p>
          </div>
          <div className="challenge-card">
            <div className="challenge-number">70%</div>
            <h3>Knowledge Lost</h3>
            <p>Most learners forget 70% of new information within 24 hours without reinforcement.</p>
          </div>
          <div className="challenge-card">
            <div className="challenge-number">$500B</div>
            <h3>Productivity Cost</h3>
            <p>Organizations lose billions annually to knowledge silos and forgotten training.</p>
          </div>
        </div>
      </section>

      {/* Future Outlook Section */}
      <section className="future-outlook-section">
        <div className="future-content fade-in">
          <h2>By 2030</h2>
          <p className="future-vision">
            MentraFlow will help millions of learners and teams turn knowledge into lasting capability.
          </p>
          <Carousel className="future-goals">
            <div className="future-goal">
              <h4>For Individuals</h4>
              <p>Students, professionals, and lifelong learners will never lose another critical insight.</p>
            </div>
            <div className="future-goal">
              <h4>For Teams</h4>
              <p>Organizations will build living knowledge networks that grow stronger with every interaction.</p>
            </div>
            <div className="future-goal">
              <h4>For Humanity</h4>
              <p>We'll unlock collective intelligence at scale — where understanding compounds, not fades.</p>
            </div>
          </Carousel>
          <div className="future-cta">
            <p className="future-tagline">The future of memory isn't about storage — it's about strength.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <Link to="/" className="footer-link">Home</Link>
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
    </div>
  );
};

export default Vision;