import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, BarChart3, Brain, CreditCard, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AppHeader.css';

const AppHeader = ({ onSettingsClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const handleSettingsClick = () => {
    setShowProfileMenu(false);
    setShowMobileMenu(false);
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // Default behavior: navigate to dashboard and open settings
      navigate('/dashboard');
      setTimeout(() => {
        // Trigger settings modal if on dashboard
        const event = new CustomEvent('openProfileSettings');
        window.dispatchEvent(event);
      }, 100);
    }
  };

  return (
    <header className="app-header">
      <div className="app-header-container">
        {/* Logo */}
        <Link to="/dashboard" className="app-logo">
          <Brain size={28} />
          <span>MentraFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="app-nav-desktop">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/activity" 
            className={`nav-link ${isActive('/activity') ? 'active' : ''}`}
          >
            <BarChart3 size={18} />
            Insights
          </Link>
          <Link 
            to="/knowledge-graph" 
            className={`nav-link ${isActive('/knowledge-graph') ? 'active' : ''}`}
          >
            <Brain size={18} />
            Knowledge Graph
          </Link>
        </nav>

        {/* Profile Menu */}
        <div className="app-header-actions">
          <div className="profile-menu-container">
            <button 
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <User size={20} />
              <span className="profile-name">{user?.name || 'User'}</span>
            </button>

            {showProfileMenu && (
              <>
                <div 
                  className="profile-menu-backdrop" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="profile-menu-dropdown">
                  <div className="profile-menu-header">
                    <User size={20} />
                    <div>
                      <div className="profile-menu-name">{user?.name || 'Demo User'}</div>
                      <div className="profile-menu-email">{user?.email || 'demo@mentraflow.com'}</div>
                    </div>
                  </div>
                  <div className="profile-menu-divider" />
                  <Link 
                    to="/billing" 
                    className="profile-menu-item"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <CreditCard size={18} />
                    Manage Plan
                  </Link>
                  <button 
                    className="profile-menu-item"
                    onClick={handleSettingsClick}
                  >
                    <Settings size={18} />
                    Profile Settings
                  </button>
                  <div className="profile-menu-divider" />
                  <button 
                    className="profile-menu-item logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          {/* User Info at Top */}
          <div className="mobile-menu-user-info">
            <div className="mobile-user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="mobile-user-details">
              <div className="mobile-user-name">{user?.name || 'User'}</div>
              <div className="mobile-user-email">{user?.email || 'user@mentraflow.com'}</div>
            </div>
          </div>
          <div className="mobile-menu-divider" />
          
          <Link 
            to="/dashboard" 
            className={`mobile-menu-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/activity" 
            className={`mobile-menu-item ${isActive('/activity') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <BarChart3 size={18} />
            Insights
          </Link>
          <Link 
            to="/knowledge-graph" 
            className={`mobile-menu-item ${isActive('/knowledge-graph') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <Brain size={18} />
            Knowledge Graph
          </Link>
          <div className="mobile-menu-divider" />
          <Link 
            to="/billing" 
            className="mobile-menu-item"
            onClick={() => setShowMobileMenu(false)}
          >
            <CreditCard size={18} />
            Manage Plan
          </Link>
          <button 
            className="mobile-menu-item"
            onClick={handleSettingsClick}
          >
            <Settings size={18} />
            Profile Settings
          </button>
          <button 
            className="mobile-menu-item logout"
            onClick={() => {
              setShowMobileMenu(false);
              handleLogout();
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
