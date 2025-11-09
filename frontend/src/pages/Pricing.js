import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import Carousel from '../components/Carousel';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Pricing = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

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

  const scrollToPlans = () => {
    document.getElementById('plans').scrollIntoView({ behavior: 'smooth' });
  };

  const handleTryMentraFlow = () => {
    navigate('/login');
  };

  return (
    <div className="pricing-page">
      <Header />

      {/* Hero Section */}
      <section className="pricing-hero-section">
        <div className="pricing-hero-content fade-in">
          <h1>Choose how you grow with MentraFlow.</h1>
          <p>
            Whether you're mastering your own mind or scaling learning across teams — we adapt to your pace.
          </p>
          <div className="pricing-hero-cta">
            <button className="btn-primary" onClick={scrollToPlans}>
              Explore Plans
            </button>
            <button className="btn-secondary" onClick={handleTryMentraFlow}>
              Try MentraFlow
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="pricing-plans-section">
        <Carousel className="pricing-cards-container">
          {/* Free Plan */}
          <div className="pricing-card">
            <div className="plan-header">
              <h3 className="plan-name">Free Plan</h3>
              <p className="plan-subtitle">Best for Students</p>
            </div>
            <div className="plan-price">
              <span className="price">$0</span>
              <span className="period">/ month</span>
            </div>
            <ul className="plan-features">
              <li>
                <Check size={20} className="check-icon" />
                Up to 50 notes
              </li>
              <li>
                <Check size={20} className="check-icon" />
                Adaptive recall
              </li>
              <li>
                <Check size={20} className="check-icon" />
                Weekly progress tracking
              </li>
            </ul>
            <button className="plan-cta" onClick={handleTryMentraFlow}>
              Start Free
            </button>
          </div>

          {/* Pro Plan - Most Popular */}
          <div className="pricing-card pricing-card-popular">
            <div className="popular-badge">⭐ Most Popular</div>
            <div className="plan-header">
              <h3 className="plan-name">Pro Plan</h3>
              <p className="plan-subtitle">Best for Consultants</p>
            </div>
            <div className="plan-price">
              <span className="price">$9.99</span>
              <span className="period">/ month</span>
            </div>
            <ul className="plan-features">
              <li>
                <Check size={20} className="check-icon" />
                Unlimited notes
              </li>
              <li>
                <Check size={20} className="check-icon" />
                Integrations (Notion, Slack, ChatGPT)
              </li>
              <li>
                <Check size={20} className="check-icon" />
                Retention analytics
              </li>
              <li>
                <Check size={20} className="check-icon" />
                Recall reminders
              </li>
            </ul>
            <button className="plan-cta plan-cta-primary" onClick={handleTryMentraFlow}>
              Try Pro
            </button>
          </div>

          {/* Teams Plan */}
          <div className="pricing-card">
            <div className="plan-header">
              <h3 className="plan-name">Teams Plan</h3>
              <p className="plan-subtitle">Best for Organizations</p>
            </div>
            <div className="plan-price">
              <span className="price">$14.99</span>
              <span className="period">/ user / month</span>
              <span className="custom-note">(Custom)</span>
            </div>
            <ul className="plan-features">
              <li>
                <Check size={20} className="check-icon" />
                Multi-seat dashboards
              </li>
              <li>
                <Check size={20} className="check-icon" />
                Team analytics
              </li>
              <li>
                <Check size={20} className="check-icon" />
                API access
              </li>
              <li>
                <Check size={20} className="check-icon" />
                Priority support
              </li>
            </ul>
            <button className="plan-cta" onClick={() => setShowModal(true)}>
              Request Demo
            </button>
          </div>
        </Carousel>

        <p className="pricing-footer-note fade-in">
          All plans include adaptive recall and secure cloud sync.
        </p>
      </section>

      {/* Benefits Section */}
      <section className="pricing-benefits-section">
        <div className="benefits-container">
          <div className="benefits-illustration fade-in">
            <div className="benefits-visual">
              <div className="visual-node node-1"></div>
              <div className="visual-node node-2"></div>
              <div className="visual-node node-3"></div>
              <div className="visual-node node-4"></div>
              <div className="visual-connection conn-1"></div>
              <div className="visual-connection conn-2"></div>
              <div className="visual-connection conn-3"></div>
            </div>
          </div>
          <div className="benefits-content">
            <h2 className="fade-in">What you'll gain with MentraFlow.</h2>
            <ul className="benefits-list">
              <li className="fade-in benefit-item-1">
                <span className="benefit-icon">🧠</span>
                <span>Reinforce your memory naturally.</span>
              </li>
              <li className="fade-in benefit-item-2">
                <span className="benefit-icon">🔄</span>
                <span>Transform reading into retention with adaptive recall.</span>
              </li>
              <li className="fade-in benefit-item-3">
                <span className="benefit-icon">📊</span>
                <span>See how your understanding strengthens each week.</span>
              </li>
              <li className="fade-in benefit-item-4">
                <span className="benefit-icon">🤝</span>
                <span>Integrate with Notion, Slack & ChatGPT.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="pricing-cta-banner">
        <div className="cta-banner-content">
          <blockquote className="fade-in">
            "Because knowledge isn't stored — it's strengthened."
          </blockquote>
          <p className="fade-in">
            Start free, stay consistent, and watch your learning evolve.
          </p>
          <button className="btn-cta-banner fade-in" onClick={handleTryMentraFlow}>
            Try MentraFlow
          </button>
        </div>
      </section>

      <Footer />

      {/* Request Demo Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h2>Request Teams Demo</h2>
            <p>
              Let's explore how MentraFlow can scale your team's learning infrastructure.
              We'll reach out within 24 hours.
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

export default Pricing;
