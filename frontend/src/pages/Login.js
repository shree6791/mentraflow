import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { useForm } from '../hooks';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const LoginContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEarlyAccessModal, setShowEarlyAccessModal] = useState(false);
  const [earlyAccessData, setEarlyAccessData] = useState({ name: '', email: '' });
  const [earlyAccessSubmitted, setEarlyAccessSubmitted] = useState(false);
  const [processingSession, setProcessingSession] = useState(false);

  // Check for session_id in URL fragment and process it
  useEffect(() => {
    // TEMPORARY BYPASS: Skip session processing, just redirect to dashboard
    const hash = window.location.hash;
    if (hash.includes('session_id')) {
      navigate('/dashboard');
      return;
    }
    
    /* COMMENTED OUT - Re-enable for production
    const processSessionId = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const sessionId = params.get('session_id');

      if (sessionId) {
        setProcessingSession(true);
        try {
          const response = await axios.post(`${API}/auth/process-session`, {
            session_id: sessionId
          }, {
            withCredentials: true
          });

          if (response.data.success) {
            window.history.replaceState(null, '', window.location.pathname);
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('Session processing error:', err);
          setError('Failed to authenticate. Please try again.');
          setProcessingSession(false);
        }
      }
    };

    processSessionId();
    */
  }, [navigate]);

  // Check if user is already authenticated
  useEffect(() => {
    // TEMPORARY BYPASS: Skip auth check
    return;
    
    /* COMMENTED OUT - Re-enable for production
    const checkAuth = async () => {
      if (processingSession) return;
      
      try {
        const response = await axios.get(`${API}/auth/me`, {
          withCredentials: true
        });
        if (response.data) {
          navigate('/dashboard');
        }
      } catch (err) {
        // Not authenticated, show login page
      }
    };

    checkAuth();
    */
  }, [navigate, processingSession]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      
      try {
        // Get user info from Google
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          }
        );
        
        const userInfo = userInfoResponse.data;
        
        // Send to our backend
        const response = await axios.post(`${API}/auth/google/callback`, {
          credential: tokenResponse.access_token,
          userInfo: userInfo
        }, {
          withCredentials: true
        });
        
        if (response.data.success) {
          login(response.data.user);
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Google login error:', err);
        setError(err.response?.data?.detail || 'Google login failed. Please try again.');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
    }
  });

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    // TEMPORARY BYPASS: Go directly to dashboard and set auth
    login({ email: formData.email || 'demo@mentraflow.com', name: 'Demo User' });
    navigate('/dashboard');
    
    /* COMMENTED OUT - Re-enable for production
    setError('');
    setLoading(true);

    // For now, show early access modal (email/password not implemented yet)
    setShowEarlyAccessModal(true);
    setLoading(false);
    */
  };

  const handleEarlyAccessSubmit = (e) => {
    e.preventDefault();
    setEarlyAccessSubmitted(true);
    setTimeout(() => {
      setShowEarlyAccessModal(false);
      setEarlyAccessSubmitted(false);
      setEarlyAccessData({ name: '', email: '' });
    }, 2000);
  };

  if (processingSession) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="auth-card">
            <div className="processing-session">
              <div className="spinner"></div>
              <p>Completing authentication...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page-integrated">
      <Header />

      {/* Login Content */}
      <div className="login-content-wrapper">
        <div className="auth-card-glass">
          <div className="auth-header">
            <h2>Welcome to MentraFlow.</h2>
            <p>Your personalized memory workspace.</p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button 
            className="google-btn" 
            onClick={() => handleGoogleLogin()}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Email/Password Login - Coming Soon */}
          <div className="email-login-coming-soon">
            <div className="coming-soon-badge">
              <span className="badge-text">Coming Soon</span>
            </div>
            <form className="auth-form disabled-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-field">
                <input
                  type="email"
                  id="email"
                  placeholder=" "
                  disabled
                />
                <label htmlFor="email">Email</label>
              </div>

              <div className="form-field">
                <input
                  type="password"
                  id="password"
                  placeholder=" "
                  disabled
                />
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="password-toggle"
                  disabled
                >
                  <Eye size={20} />
                </button>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    disabled
                  />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-password" disabled>
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="submit-btn" disabled>
                Login
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />

      {/* Early Access Modal */}
      {showEarlyAccessModal && (
        <div className="modal-overlay" onClick={() => setShowEarlyAccessModal(false)}>
          <div className="modal-content early-access-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEarlyAccessModal(false)}>
              ×
            </button>
            
            {!earlyAccessSubmitted ? (
              <>
                <h3>Join Early Access</h3>
                <p>Be among the first to experience MentraFlow's memory infrastructure.</p>
                <form onSubmit={handleEarlyAccessSubmit}>
                  <div className="form-field">
                    <input
                      type="text"
                      value={earlyAccessData.name}
                      onChange={(e) => setEarlyAccessData({...earlyAccessData, name: e.target.value})}
                      placeholder=" "
                      required
                    />
                    <label>Name</label>
                  </div>
                  <div className="form-field">
                    <input
                      type="email"
                      value={earlyAccessData.email}
                      onChange={(e) => setEarlyAccessData({...earlyAccessData, email: e.target.value})}
                      placeholder=" "
                      required
                    />
                    <label>Email</label>
                  </div>
                  <button type="submit" className="submit-btn">Join Waitlist</button>
                </form>
              </>
            ) : (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>You're on the list!</h3>
                <p>We'll reach out soon with early access.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with GoogleOAuthProvider
const Login = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
};

export default Login;