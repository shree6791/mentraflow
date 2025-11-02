import React from 'react';
import AppHeader from './AppHeader';
import PageHeader from './PageHeader';
import './AppLayout.css';

const AppLayout = ({ 
  title, 
  subtitle, 
  children,
  maxWidth = '1400px' 
}) => {
  return (
    <div className="app-layout">
      {/* App Header - Navigation */}
      <AppHeader />
      
      {/* Page Content Container */}
      <div className="app-layout-content" style={{ maxWidth }}>
        {/* Page Header - Title & Subtitle */}
        {title && (
          <PageHeader title={title} subtitle={subtitle} />
        )}
        
        {/* Page-specific Content */}
        <div className="app-layout-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
