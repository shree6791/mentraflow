import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, Check } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import PageHeader from '../components/PageHeader';
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
  const [applePayAvailable, setApplePayAvailable] = useState(false);

  // Check if Apple Pay is available (for demo, always show)
  useEffect(() => {
    // In production: check if (window.ApplePaySession)
    // For demo purposes, always show
    setApplePayAvailable(true);
  }, []);

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

  const handleApplePay = () => {
    setProcessing(true);
    
    // Simulate Apple Pay processing
    setTimeout(() => {
      setProcessing(false);
      navigate('/dashboard?payment=success');
    }, 2000);
    
    // In production, implement actual Apple Pay integration:
    // const paymentRequest = {
    //   countryCode: 'US',
    //   currencyCode: 'USD',
    //   total: {
    //     label: selectedPlan.name,
    //     amount: totalPrice
    //   }
    // };
    // const session = new ApplePaySession(3, paymentRequest);
    // session.begin();
  };

  return (
    <div className="payment-page">
      {/* App Header */}
      <AppHeader />
      
      {/* Page Header */}
      <PageHeader 
        title="Complete Your Purchase"
        subtitle="Secure checkout • Upgrade your learning experience"
      />
      
      <div className="payment-container">

        <div className="payment-content">
          {/* Left: Payment Form */}
          <div className="payment-form-section">
            <div className="payment-form-header">
              <div className="secure-badge">
                <Lock size={16} />
                <span>Secure Checkout</span>
              </div>
            </div>

            {/* Apple Pay Button */}
            {applePayAvailable && (
              <>
                <button 
                  type="button"
                  className="apple-pay-button"
                  onClick={handleApplePay}
                  disabled={processing}
                >
                  <svg width="45" height="18" viewBox="0 0 45 18" fill="currentColor">
                    <path d="M9.305 2.377c.559-.69 .934-1.647.832-2.602-.805.033-1.778.557-2.354 1.246-.518.607-.97 1.58-.848 2.513.897.066 1.811-.459 2.37-1.157zm.832 1.311c-1.311-.066-2.42.738-3.038.738-.617 0-1.574-.705-2.583-.689-1.328.017-2.55.772-3.235 1.968-1.377 2.403-.362 5.97.984 7.922.657.951 1.443 2.027 2.476 1.985.984-.033 1.361-.64 2.558-.64 1.197 0 1.541.64 2.583.623 1.066-.017 1.754-.984 2.411-1.935.756-1.099 1.066-2.164 1.082-2.214-.025-.017-2.075-.804-2.092-3.186-.017-1.985 1.623-2.935 1.689-2.985-.919-1.361-2.354-1.525-2.869-1.558z"/>
                    <path d="M18.673 1.442c2.666 0 4.518 1.836 4.518 4.485 0 2.666-1.885 4.518-4.568 4.518h-2.95v4.936h-2.23V1.442h5.23zm-2.999 7.087h2.452c1.853 0 2.916-1.001 2.916-2.617 0-1.615-1.063-2.6-2.916-2.6h-2.452v5.217zm11.908 7.536c-1.736 0-2.849-1.163-2.849-2.966 0-1.82 1.113-2.933 3.053-3.053l2.232-.133v-.668c0-.984-.668-1.565-1.736-1.565-.952 0-1.62.448-1.753 1.213h-1.969c.066-1.77 1.586-3.102 3.772-3.102 2.182 0 3.605 1.246 3.605 3.186v6.819h-2.065v-1.686h-.033c-.448.984-1.553 1.953-2.95 1.953l-.307.002zm.852-1.72c1.113 0 1.902-.7 1.902-1.67v-.665l-1.969.133c-.984.066-1.536.532-1.536 1.213 0 .698.535 1.113 1.603.99zm11.593-12.903v4.37h.033c.465-1.08 1.5-1.902 3.003-1.902 2.199 0 3.539 1.62 3.539 4.336 0 2.733-1.373 4.37-3.589 4.37-1.503 0-2.521-.805-2.986-1.902h-.033v1.67h-2.048V1.442h2.081zm2.033 12.754c1.38 0 2.215-1.08 2.215-2.933 0-1.836-.835-2.916-2.215-2.916-1.364 0-2.198 1.096-2.198 2.916 0 1.836.834 2.933 2.198 2.933zm6.406-12.754h2.065v4.37h.033c.481-1.08 1.503-1.902 3.02-1.902 2.198 0 3.538 1.62 3.538 4.336 0 2.733-1.373 4.37-3.588 4.37-1.503 0-2.522-.805-2.987-1.902h-.033v1.67h-2.048V1.442zm2.033 12.754c1.381 0 2.215-1.08 2.215-2.933 0-1.836-.834-2.916-2.215-2.916-1.364 0-2.198 1.096-2.198 2.916 0 1.836.834 2.933 2.198 2.933z"/>
                  </svg>
                  <span>Pay</span>
                </button>

                <div className="payment-divider">
                  <span>Or pay with card</span>
                </div>
              </>
            )}

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
                {processing ? 'Processing...' : `Pay $${totalPrice}/month`}
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
                {planId === 'teams' && (
                  <p className="member-count">{memberCount} team members</p>
                )}
                <div className="plan-price-summary">
                  <span className="price">${totalPrice}</span>
                  <span className="period">/ month</span>
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
                {planId === 'teams' && (
                  <div className="price-row">
                    <span>${selectedPlan.price} × {memberCount} users</span>
                    <span>${totalPrice}</span>
                  </div>
                )}
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="price-row">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="price-row total">
                  <span>Total</span>
                  <span>${totalPrice}</span>
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
