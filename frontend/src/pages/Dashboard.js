import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Mail } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          withCredentials: true
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        withCredentials: true
      });
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <Link to="/" className="dashboard-logo">MentraFlow</Link>
        <div className="dashboard-user">
          <div className="user-info">
            {user?.picture && (
              <img src={user.picture} alt={user.name} className="user-avatar" />
            )}
            <span>{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p>Your personalized memory workspace is ready.</p>
        </div>

        <div className="dashboard-content">
          <div className="info-card">
            <User size={32} />
            <h3>Profile</h3>
            <div className="info-details">
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
          </div>

          <div className="info-card">
            <Mail size={32} />
            <h3>Stay Updated</h3>
            <p>We're building something incredible. Check back soon for the full MentraFlow experience.</p>
          </div>

          <div className="info-card highlight">
            <div className="card-content">
              <h3>🚀 Coming Soon</h3>
              <ul>
                <li>Capture notes, chats, and ideas</li>
                <li>AI-powered memory reinforcement</li>
                <li>Spaced repetition reminders</li>
                <li>Knowledge graph visualization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;