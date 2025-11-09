import React from 'react';
import { Loader } from 'lucide-react';
import './LoadingBanner.css';

const LoadingBanner = ({ message = 'Loading...', type = 'default' }) => {
  return (
    <div className={`loading-banner loading-banner-${type}`}>
      <div className="loading-banner-content">
        <Loader className="loading-spinner-icon" size={24} />
        <span className="loading-message">{message}</span>
      </div>
    </div>
  );
};

export default LoadingBanner;
