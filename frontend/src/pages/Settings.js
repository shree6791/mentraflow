import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Globe, Bell, Save } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import '../styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: 'Demo User',
    email: 'demo@mentraflow.com',
    phone: '',
    timezone: 'America/New_York'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    reviewReminders: true,
    weeklyReports: true
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: API call to save settings
      console.log('Saving settings:', { ...formData, ...notifications });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <AppLayout 
      title="Profile Settings"
      subtitle="Manage your account information and preferences"
    >
      <div className="settings-container">
        <form onSubmit={handleSubmit} className="settings-form">
          {/* Personal Information Section */}
          <section className="settings-section">
            <h2>Personal Information</h2>
            
            <div className="form-group">
              <label htmlFor="name">
                <User size={18} />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                <Phone size={18} />
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="timezone">
                <Globe size={18} />
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">Shanghai (CST)</option>
                <option value="Australia/Sydney">Sydney (AEDT)</option>
              </select>
            </div>
          </section>

          {/* Notification Preferences Section */}
          <section className="settings-section">
            <h2>
              <Bell size={20} />
              Notification Preferences
            </h2>

            <div className="toggle-group">
              <div className="toggle-item">
                <div className="toggle-label">
                  <h3>Email Notifications</h3>
                  <p>Receive updates and announcements via email</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={() => handleNotificationChange('emailNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-label">
                  <h3>Review Reminders</h3>
                  <p>Get notified when topics need review</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.reviewReminders}
                    onChange={() => handleNotificationChange('reviewReminders')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-label">
                  <h3>Weekly Progress Reports</h3>
                  <p>Receive weekly summaries of your learning</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.weeklyReports}
                    onChange={() => handleNotificationChange('weeklyReports')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={18} />
              Save Changes
            </button>
          </div>

          {/* Success Message */}
          {saved && (
            <div className="save-success">
              ✓ Settings saved successfully!
            </div>
          )}
        </form>
      </div>
    </AppLayout>
  );
};

export default Settings;
