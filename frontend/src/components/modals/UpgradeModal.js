import React from 'react';
import { X, Check } from 'lucide-react';
import Carousel from '../Carousel';

const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  plans, 
  teamMemberCount, 
  setTeamMemberCount, 
  onUpgrade 
}) => {
  if (!isOpen) return null;

  const renderPlanCard = (plan) => (
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
      
      {/* Team Member Selector for Teams Plan */}
      {plan.id === 'teams' && (
        <div className="team-selector">
          <div className="team-selector-row">
            <label>Number of team members:</label>
            <div className="quantity-selector">
              <button 
                type="button"
                onClick={() => setTeamMemberCount(Math.max(2, teamMemberCount - 1))}
                className="qty-btn"
              >
                −
              </button>
              <input 
                type="number" 
                value={teamMemberCount}
                onChange={(e) => setTeamMemberCount(Math.max(2, parseInt(e.target.value) || 2))}
                min="2"
                className="qty-input"
              />
              <button 
                type="button"
                onClick={() => setTeamMemberCount(teamMemberCount + 1)}
                className="qty-btn"
              >
                +
              </button>
            </div>
          </div>
          <p className="total-price">
            Total: <strong>${(plan.price * teamMemberCount).toFixed(2)}/month</strong>
          </p>
        </div>
      )}
      
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
        onClick={() => onUpgrade(plan.id)}
      >
        {plan.id === 'teams' ? `Select for ${teamMemberCount} users` : `Select ${plan.name}`}
      </button>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upgrade Your Plan</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-body" style={{width: '100%', padding: 0}}>
          {/* Desktop: Grid layout */}
          <div className="upgrade-plans-grid">
            {plans.map(plan => renderPlanCard(plan))}
          </div>

          {/* Mobile: Carousel */}
          <div className="upgrade-plans-carousel" style={{width: '100%', maxWidth: '100%', margin: '0 -0.5rem'}}>
            <Carousel className="billing-carousel">
              {plans.map(plan => renderPlanCard(plan))}
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
