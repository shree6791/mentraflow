import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, TrendingUp, Check } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { UpgradeModal } from '../components/modals';
import { getUpgradePlans } from '../constants/pricingPlans';
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

  // Get upgrade plans from shared constants
  const plans = getUpgradePlans();

  const handleUpgrade = (planId) => {
    console.log('Upgrading to:', planId);
    // Navigate to payment page with plan info and team count
    if (planId === 'teams') {
      navigate(`/payment?plan=${planId}&members=${teamMemberCount}`);
    } else {
      navigate(`/payment?plan=${planId}`);
    }
    setShowUpgradeModal(false);
  };

  return (
    <AppLayout 
      title="Billing & Plans"
      subtitle="Manage your subscription and view usage details"
    >
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
                  <span className="price-free">Free ($0)</span>
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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        plans={plans}
        teamMemberCount={teamMemberCount}
        setTeamMemberCount={setTeamMemberCount}
        onUpgrade={handleUpgrade}
      />
    </AppLayout>
  );
};

export default Billing;