import React from 'react';
import { Check } from 'lucide-react';

const PricingCard = ({ plan, onCTAClick, isPopular }) => {
  return (
    <div className={`pricing-card ${isPopular || plan.popular ? 'pricing-card-popular' : ''}`}>
      {(isPopular || plan.popular) && <div className="popular-badge">⭐ Most Popular</div>}
      <div className="plan-header">
        <h3 className="plan-name">{plan.name}</h3>
        <p className="plan-subtitle">{plan.subtitle}</p>
      </div>
      <div className="plan-price">
        <span className="price">${plan.price}</span>
        <span className="period">{plan.period}</span>
        {plan.id === 'teams' && <span className="custom-note">(Custom)</span>}
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
        onClick={() => onCTAClick(plan.id)}
      >
        {plan.ctaText || `Select ${plan.name}`}
      </button>
    </div>
  );
};

export default PricingCard;
