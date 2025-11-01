import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Carousel.css';

const Carousel = ({ children, itemsPerView = 3, className = '' }) => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToIndex = (index) => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const itemWidth = scrollWidth / totalItems;
      carouselRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  const handleScroll = () => {
    if (carouselRef.current && isMobile) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const itemWidth = carouselRef.current.scrollWidth / totalItems;
      const index = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(index);
    }
  };

  // Don't show carousel controls on desktop
  if (!isMobile) {
    return (
      <div className={`carousel-grid ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className="carousel-container">
      <div 
        className={`carousel-wrapper ${className}`}
        ref={carouselRef}
        onScroll={handleScroll}
      >
        {children}
      </div>
      
      {/* Navigation Arrows */}
      <button 
        className="carousel-arrow carousel-arrow-left" 
        onClick={handlePrev}
        aria-label="Previous"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        className="carousel-arrow carousel-arrow-right" 
        onClick={handleNext}
        aria-label="Next"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="carousel-dots">
        {childrenArray.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => scrollToIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
