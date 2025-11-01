import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="logo">
        MentraFlow
      </Link>
      
      {/* Hamburger Toggle */}
      <button 
        className="mobile-menu-toggle" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
        <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link to="/science" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Science</Link>
        <Link to="/vision" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Vision</Link>
        <Link to="/pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
        <Link to="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        <Link to="/login" className="btn-login" onClick={() => setMobileMenuOpen(false)}>
          Login
        </Link>
      </nav>
    </header>
  );
};

export default Header;
