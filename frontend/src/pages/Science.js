import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, Network } from 'lucide-react';
import Carousel from '../components/Carousel';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Science = () => {

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

  return (
    <div>
      <Header />

      {/* Hero Section */}
      <section className="science-hero">
        <div className="hero-content">
          <h1 className="fade-in">Your brain learns through rhythm — MentraFlow follows it.</h1>
          <p className="fade-in">
            Every principle inside MentraFlow comes from proven neuroscience — made effortless by AI.
          </p>
        </div>
        <div className="brainwave-container fade-in">
          <svg className="brainwave" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0E7C7B" />
                <stop offset="50%" stopColor="#118AB2" />
                <stop offset="100%" stopColor="#FFD166" />
              </linearGradient>
            </defs>
            <path
              className="wave-path"
              d="M0,100 Q50,50 100,100 T200,100 T300,100 T400,100 T500,100 T600,100 T700,100 T800,100"
              fill="none"
              strokeWidth="3"
            />
          </svg>
        </div>
      </section>

      {/* Core Science Section */}
      <section className="section core-science-section">
        <Carousel className="science-grid">
          <div className="science-card">
            <div className="science-icon spacing-icon">
              <div className="curve-animation"></div>
            </div>
            <h3>Spacing Effect</h3>
            <p className="science-principle">Reinforce before forgetting.</p>
            <p className="science-description">
              Memory retention increases when learning is distributed over time. MentraFlow reminds you right before the forgetting curve drops — keeping knowledge fresh.
            </p>
          </div>

          <div className="science-card">
            <div className="science-icon recall-icon">
              <RefreshCw size={48} strokeWidth={2} />
            </div>
            <h3>Active Recall</h3>
            <p className="science-principle">Retrieval strengthens neural links.</p>
            <p className="science-description">
              Every time you recall information, you strengthen the neural pathways. MentraFlow prompts you to actively retrieve — not just passively re-read.
            </p>
          </div>

          <div className="science-card">
            <div className="science-icon neuro-icon">
              <Network size={48} strokeWidth={2} />
            </div>
            <h3>Neuroplasticity</h3>
            <p className="science-principle">Your memory grows stronger each time you revisit.</p>
            <p className="science-description">
              Your brain physically rewires itself when you learn. Each interaction with MentraFlow builds stronger, more interconnected memory networks.
            </p>
          </div>
        </Carousel>
      </section>

      {/* Behavioral Memory Graph Section */}
      <section className="section memory-graph-section">
        <div className="fade-in">
          <h2 className="section-title">Your learning, visualized.</h2>
          <p className="section-subtitle">
            MentraFlow maps how your ideas connect — strengthening what fades.
          </p>
        </div>
        <div className="graph-container fade-in">
          <div className="graph-visual">
            <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
              {/* Axes */}
              <line x1="50" y1="250" x2="550" y2="250" stroke="#0E7C7B" strokeWidth="2" />
              <line x1="50" y1="250" x2="50" y2="50" stroke="#0E7C7B" strokeWidth="2" />
              
              {/* Forgetting curve (without MentraFlow) */}
              <path
                d="M50,100 Q150,80 200,150 T300,220 T400,240"
                fill="none"
                stroke="#CBD5E0"
                strokeWidth="3"
                strokeDasharray="5,5"
                opacity="0.6"
              />
              
              {/* Inline label for forgetting curve */}
              <text x="410" y="235" fill="#718096" fontSize="13" fontFamily="Inter" fontWeight="500">
                Without MentraFlow
              </text>
              
              {/* Learning curve (with MentraFlow) */}
              <path
                className="learning-curve"
                d="M50,100 Q100,90 150,85 T250,80 T350,75 T450,70 T550,65"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
              />
              
              {/* Inline label for learning curve */}
              <text x="470" y="60" fill="#0E7C7B" fontSize="13" fontFamily="Inter" fontWeight="600">
                With MentraFlow
              </text>
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0E7C7B" />
                  <stop offset="50%" stopColor="#118AB2" />
                  <stop offset="100%" stopColor="#FFD166" />
                </linearGradient>
              </defs>
              
              {/* Data points */}
              <circle cx="50" cy="100" r="6" fill="#0E7C7B" className="data-point" />
              <circle cx="150" cy="85" r="6" fill="#118AB2" className="data-point" />
              <circle cx="250" cy="80" r="6" fill="#118AB2" className="data-point" />
              <circle cx="350" cy="75" r="6" fill="#FFD166" className="data-point" />
              <circle cx="450" cy="70" r="6" fill="#FFD166" className="data-point" />
              <circle cx="550" cy="65" r="6" fill="#FF6B6B" className="data-point" />
              
              {/* Labels */}
              <text x="300" y="280" textAnchor="middle" fill="#4a5568" fontSize="14" fontFamily="Inter">Time</text>
              <text x="20" y="150" textAnchor="middle" fill="#4a5568" fontSize="14" fontFamily="Inter" transform="rotate(-90 20 150)">Memory Retention</text>
            </svg>
          </div>
        </div>
      </section>

      {/* Research Section */}
      <section className="section research-section">
        <div className="fade-in">
          <h2 className="section-title">Grounded in Research</h2>
          <p className="section-subtitle">
            MentraFlow builds on decades of cognitive science research from leading institutions.
          </p>
        </div>
        <Carousel className="research-grid">
          <div className="research-card">
            <h4>Ebbinghaus (1885)</h4>
            <p>Discovered the forgetting curve — showing rapid memory decay without reinforcement.</p>
          </div>
          <div className="research-card">
            <h4>Bjork & Bjork (1992)</h4>
            <p>Demonstrated that desirable difficulties during learning improve long-term retention.</p>
          </div>
          <div className="research-card">
            <h4>Roediger & Karpicke (2006)</h4>
            <p>Proved that retrieval practice is more effective than repeated studying.</p>
          </div>
          <div className="research-card">
            <h4>Stanford & MIT Research</h4>
            <p>Modern neuroscience shows how spaced repetition physically strengthens neural pathways.</p>
          </div>
        </Carousel>
      </section>

      <Footer />
    </div>
  );
};

export default Science;