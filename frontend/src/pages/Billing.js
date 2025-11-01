import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, TrendingUp, X, Check, ArrowLeft } from 'lucide-react';
import Carousel from '../components/Carousel';
import '../styles/Billing.css';

const Billing = () => {
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [teamMemberCount, setTeamMemberCount] = useState(5); // Default 5 users

  // Mock data - Replace with actual API calls
  const currentPlan = {
    name: 'Free Plan',
    price: 0,
    billingCycle: 'monthly',
    nextBillingDate: null,
    features: ['5 notes limit', 'Basic retention tracking', 'Manual reviews']
  };

  const usage = {
    notesUsed: 3,
    notesLimit: 5,
    storageUsed: '2.3 MB',
    storageLimit: '50 MB'
  };

  const plans = [
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 9.99,
      period: '/ month',
      subtitle: 'Best for Consultants',
      features: [
        'Unlimited notes',
        'Integrations (Notion, Slack, ChatGPT)',
        'Retention analytics',
        'Recall reminders'
      ],
      popular: true
    },
    {
      id: 'teams',
      name: 'Teams Plan',
      price: 14.99,
      period: '/ user / month',
      subtitle: 'Best for Organizations',
      features: [
        'Multi-seat dashboards',
        'Team analytics',
        'Priority support',
        'Custom integrations'
      ],
      popular: false
    }
  ];

  const handleUpgrade = (planId) => {
    console.log('Upgrading to:', planId);
    // Navigate to payment page with plan info
    navigate(`/payment?plan=${planId}`);
    setShowUpgradeModal(false);
  };

  return (
    <div className="billing-page">
      {/* Header */}
      <div className="billing-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>Billing & Plans</h1>
      </div>

      <div className="billing-content">
        {/* Current Plan Card */}
        <section className="billing-section">
          <h2>Current Plan</h2>
          <div className="current-plan-card">
            <div className="plan-info">
              <div className="plan-badge">
                {currentPlan.name === 'Free Plan' ? '🆓 Free' : '⭐ Pro'}
              </div>
              <h3>{currentPlan.name}</h3>
              <div className="plan-price-display">
                {currentPlan.price === 0 ? (
                  <span className="price-free">Free Forever</span>
                ) : (
                  <>
                    <span className="price-amount">${currentPlan.price}</span>
                    <span className="price-period">/ {currentPlan.billingCycle}</span>
                  </>
                )}
              </div>
              {currentPlan.nextBillingDate && (
                <p className="next-billing">
                  <Calendar size={16} />
                  Next billing: {currentPlan.nextBillingDate}
                </p>
              )}
            </div>
            <div className="plan-actions">
              <button 
                className="btn-upgrade"
                onClick={() => setShowUpgradeModal(true)}
              >
                <TrendingUp size={18} />
                Upgrade Plan
              </button>
            </div>
          </div>

          {/* Current Plan Features */}
          <div className="current-features">
            <h4>Your Features</h4>
            <ul>
              {currentPlan.features.map((feature, index) => (
                <li key={index}>
                  <Check size={16} className="feature-check" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Usage Stats */}
        <section className="billing-section">
          <h2>Usage</h2>
          <div className="usage-cards">
            <div className="usage-card">
              <h4>Notes</h4>
              <div className="usage-stat">
                <span className="usage-number">{usage.notesUsed}</span>
                <span className="usage-limit">/ {usage.notesLimit}</span>
              </div>
              <div className="usage-bar">
                <div 
                  className="usage-bar-fill"
                  style={{width: `${(usage.notesUsed / usage.notesLimit) * 100}%`}}
                ></div>
              </div>
            </div>
            <div className="usage-card">
              <h4>Storage</h4>
              <div className="usage-stat">
                <span className="usage-number">{usage.storageUsed}</span>
                <span className="usage-limit">/ {usage.storageLimit}</span>
              </div>
              <div className="usage-bar">
                <div 
                  className="usage-bar-fill"
                  style={{width: '4.6%'}}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Method - Only show for paid plans */}
        {currentPlan.price > 0 && (
          <section className="billing-section">
            <h2>Payment Method</h2>
            <div className="payment-method-card">
              <CreditCard size={24} />
              <div className="payment-info">
                <p className="card-type">Visa ending in 4242</p>
                <p className="card-expiry">Expires 12/2025</p>
              </div>
              <button className="btn-update">Update</button>
            </div>
          </section>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upgrade Your Plan</h2>
              <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {/* Desktop: Grid layout */}
              <div className="upgrade-plans-grid">
                {plans.map((plan) => (
                  <div key={plan.id} className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}>
                    {plan.popular && <div className="popular-badge">⭐ Most Popular</div>}
                    <div className="plan-header">
                      <h3 className="plan-name">{plan.name}</h3>
                      <p className="plan-subtitle">{plan.subtitle}</p>
                    </div>
                    <div className="plan-price">
                      <span className="price">${plan.price}</span>
                      <span className="period">{plan.period}</span>
                    </div>
                    <ul className="plan-features">
                      {plan.features.map((feature, idx) => (
                        <li key={idx}>
                          <Check size={20} className="check-icon" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button 
                      className={`plan-cta ${plan.popular ? 'plan-cta-primary' : ''}`}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      Select {plan.name}
                    </button>
                  </div>
                ))}
              </div>

              {/* Mobile: Carousel */}
              <div className="upgrade-plans-carousel">
                <Carousel>
                  {plans.map((plan) => (
                    <div key={plan.id} className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}>
                      {plan.popular && <div className="popular-badge">⭐ Most Popular</div>}
                      <div className="plan-header">
                        <h3 className="plan-name">{plan.name}</h3>
                        <p className="plan-subtitle">{plan.subtitle}</p>
                      </div>
                      <div className="plan-price">
                        <span className="price">${plan.price}</span>
                        <span className="period">{plan.period}</span>
                      </div>
                      <ul className="plan-features">
                        {plan.features.map((feature, idx) => (
                          <li key={idx}>
                            <Check size={20} className="check-icon" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button 
                        className={`plan-cta ${plan.popular ? 'plan-cta-primary' : ''}`}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        Select {plan.name}
                      </button>
                    </div>
                  ))}
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
