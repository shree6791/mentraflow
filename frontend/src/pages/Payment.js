import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, Check } from 'lucide-react';
import '../styles/Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  const memberCount = parseInt(searchParams.get('members')) || 1;

  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    zipCode: ''
  });

  const [processing, setProcessing] = useState(false);

  // Plan details
  const plans = {
    pro: {
      name: 'Pro Plan',
      price: 9.99,
      period: '/ month',
      features: [
        'Unlimited notes',
        'Integrations (Notion, Slack, ChatGPT)',
        'Retention analytics',
        'Recall reminders'
      ]
    },
    teams: {
      name: 'Teams Plan',
      price: 14.99,
      period: '/ user / month',
      features: [
        'Multi-seat dashboards',
        'Team analytics',
        'Priority support',
        'Custom integrations'
      ]
    }
  };

  const selectedPlan = plans[planId] || plans.pro;
  const totalPrice = planId === 'teams' 
    ? (selectedPlan.price * memberCount).toFixed(2)
    : selectedPlan.price.toFixed(2);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData({ ...formData, [name]: formatted });
    }
    // Format expiry date
    else if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substr(0, 5);
      setFormData({ ...formData, [name]: formatted });
    }
    // Limit CVV to 3-4 digits
    else if (name === 'cvv') {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '').substr(0, 4) });
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      // Navigate to success page or dashboard
      navigate('/dashboard?payment=success');
    }, 2000);
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* Header */}
        <button className="back-btn" onClick={() => navigate('/billing')}>
          <ArrowLeft size={20} />
          Back to Billing
        </button>

        <div className="payment-content">
          {/* Left: Payment Form */}
          <div className="payment-form-section">
            <div className="payment-header">
              <h1>Complete Your Purchase</h1>
              <div className="secure-badge">
                <Lock size={16} />
                <span>Secure Checkout</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-section">
                <h3>Payment Information</h3>
                
                <div className="form-group">
                  <label>Card Number</label>
                  <div className="input-with-icon">
                    <CreditCard size={20} />
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength="19"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    placeholder="John Doe"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      maxLength="5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Billing Address</h3>
                
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="billingAddress"
                    placeholder="123 Main St, City, State"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-submit-payment"
                disabled={processing}
              >
                {processing ? 'Processing...' : `Pay $${selectedPlan.price}${selectedPlan.period}`}
              </button>

              <p className="payment-note">
                Your payment is secure and encrypted. You can cancel anytime.
              </p>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary">
              <h3>Order Summary</h3>
              
              <div className="plan-summary">
                <div className="plan-badge">{selectedPlan.name}</div>
                <div className="plan-price-summary">
                  <span className="price">${selectedPlan.price}</span>
                  <span className="period">{selectedPlan.period}</span>
                </div>
              </div>

              <div className="features-summary">
                <h4>What's Included:</h4>
                <ul>
                  {selectedPlan.features.map((feature, idx) => (
                    <li key={idx}>
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>${selectedPlan.price}</span>
                </div>
                <div className="price-row">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="price-row total">
                  <span>Total</span>
                  <span>${selectedPlan.price}</span>
                </div>
              </div>

              <div className="billing-cycle-note">
                <p>Billed monthly. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
