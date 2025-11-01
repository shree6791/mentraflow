import React, { useState, useEffect } from 'react';
import { Linkedin, Twitter, Youtube, Mail, Send, CheckCircle, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Static confirmation for now
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div>
      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="logo">
          MentraFlow
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/science" className="nav-link">Science</Link>
          <Link to="/vision" className="nav-link">Vision</Link>
          <Link to="/pricing" className="nav-link">Pricing</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/login" className="btn-login">
            Login
          </Link>
        </nav>
      </header>

      {/* Contact Hero Section */}
      <section className="contact-hero">
        <div className="contact-wave-bg"></div>
        <div className="hero-content fade-in">
          <h1>We'd love to hear from you.</h1>
          <p>
            Whether you're a curious learner or potential collaborator,<br />
            let's start a conversation.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section contact-form-section">
        <div className="contact-container">
          <div className="form-wrapper fade-in">
            {!submitted ? (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us what's on your mind..."
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  <Send size={20} />
                  <span>Send Message</span>
                </button>
              </form>
            ) : (
              <div className="success-message">
                <CheckCircle size={64} />
                <h3>Message sent successfully!</h3>
                <p>We'll get back to you as soon as possible.</p>
              </div>
            )}
          </div>

          {/* Alternative Contact */}
          <div className="alternative-contact fade-in">
            <div className="contact-method">
              <Mail size={32} />
              <h3>Email us directly</h3>
              <a href="mailto:hello@mentraflow.com" className="contact-link">
                hello@mentraflow.com
              </a>
            </div>

            <div className="contact-method">
              <div className="social-icons-contact">
                <a href="#" className="social-icon-lg" aria-label="LinkedIn">
                  <Linkedin size={28} />
                </a>
                <a href="#" className="social-icon-lg" aria-label="Twitter">
                  <Twitter size={28} />
                </a>
                <a href="#" className="social-icon-lg" aria-label="YouTube">
                  <Youtube size={28} />
                </a>
              </div>
              <h3>Connect with us</h3>
              <p className="social-text">Follow our journey on social media</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  );
};

export default Contact;