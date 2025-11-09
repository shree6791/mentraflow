import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import PricingCard from '../components/PricingCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { getAllPlans } from '../constants/pricingPlans';
import { useModal } from '../hooks';

const Pricing = () => {
  const navigate = useNavigate();
  const modal = useModal(false);
  const plans = getAllPlans();

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

  const handlePlanCTA = (planId) => {
    if (planId === 'teams') {
      modal.open();
    } else {
      navigate('/login');
    }
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
          {plans.map(plan => (
            <PricingCard 
              key={plan.id}
              plan={plan}
              onCTAClick={handlePlanCTA}
            />
          ))}
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
      {modal.isOpen && (
        <div className="modal-overlay" onClick={modal.close}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={modal.close}>
              ×
            </button>
            <h2>Request Teams Demo</h2>
            <p>
              Let's explore how MentraFlow can scale your team's learning infrastructure.
              We'll reach out within 24 hours.
            </p>
            <button className="btn-primary" onClick={modal.close}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
