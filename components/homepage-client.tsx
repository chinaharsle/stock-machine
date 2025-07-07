"use client";

import { useEffect } from 'react';

export function HomepageClient() {
  useEffect(() => {
    let heroSlideIndex = 0;
    let heroSlideInterval: NodeJS.Timeout;

    // Initialize Hero Slider
    function initializeHeroSlider() {
      const slides = document.querySelectorAll('.hero-slide');
      const indicators = document.querySelectorAll('.indicator');
      
      if (slides.length <= 1) return;
      
      // Start auto rotation
      heroSlideInterval = setInterval(nextSlide, 5000);
      
      // Pause on hover
      const heroSection = document.querySelector('.hero-section');
      heroSection?.addEventListener('mouseenter', () => {
        clearInterval(heroSlideInterval);
      });
      
      heroSection?.addEventListener('mouseleave', () => {
        heroSlideInterval = setInterval(nextSlide, 5000);
      });

      // Setup indicator clicks
      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
          goToSlide(index);
        });
      });
    }

    function nextSlide() {
      const slides = document.querySelectorAll('.hero-slide');
      const indicators = document.querySelectorAll('.indicator');
      
      slides[heroSlideIndex]?.classList.remove('active');
      indicators[heroSlideIndex]?.classList.remove('active');
      
      heroSlideIndex = (heroSlideIndex + 1) % slides.length;
      
      slides[heroSlideIndex]?.classList.add('active');
      indicators[heroSlideIndex]?.classList.add('active');
    }

    function goToSlide(index: number) {
      const slides = document.querySelectorAll('.hero-slide');
      const indicators = document.querySelectorAll('.indicator');
      
      slides[heroSlideIndex]?.classList.remove('active');
      indicators[heroSlideIndex]?.classList.remove('active');
      
      heroSlideIndex = index;
      
      slides[heroSlideIndex]?.classList.add('active');
      indicators[heroSlideIndex]?.classList.add('active');
      
      // Reset auto rotation
      clearInterval(heroSlideInterval);
      heroSlideInterval = setInterval(nextSlide, 5000);
    }

    // Setup Back to Top Button
    function setupBackToTop() {
      const backToTopBtn = document.getElementById('backToTop');
      
      if (backToTopBtn) {
        const handleScroll = () => {
          if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
          } else {
            backToTopBtn.classList.remove('visible');
          }
        };

        const handleClick = () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.addEventListener('scroll', handleScroll);
        backToTopBtn.addEventListener('click', handleClick);

        // Cleanup
        return () => {
          window.removeEventListener('scroll', handleScroll);
          backToTopBtn.removeEventListener('click', handleClick);
        };
      }
    }

    // Initialize everything
    initializeHeroSlider();
    const cleanupBackToTop = setupBackToTop();

    // Cleanup function
    return () => {
      clearInterval(heroSlideInterval);
      cleanupBackToTop?.();
    };
  }, []);

  return null; // This component doesn't render anything
} 