import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/science" className="footer-link">Science</Link>
          <Link to="/vision" className="footer-link">Vision</Link>
          <Link to="/pricing" className="footer-link">Pricing</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
        </div>
        <div className="social-links">
          <a href="#" className="social-link" aria-label="LinkedIn">
            <Linkedin size={20} />
          </a>
          <a href="#" className="social-link" aria-label="Twitter">
            <Twitter size={20} />
          </a>
          <a href="#" className="social-link" aria-label="YouTube">
            <Youtube size={20} />
          </a>
        </div>
        <p className="footer-tagline">
          Because knowledge isn't stored — it's strengthened.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
