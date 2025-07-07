"use client";

import { useEffect } from 'react';

export function DashboardClient() {
  useEffect(() => {
    // Setup mobile menu
    function setupMobileMenu() {
      const mobileMenuToggle = document.getElementById('mobileMenuToggle');
      const sidebar = document.getElementById('sidebar');
      
      if (!mobileMenuToggle || !sidebar) return;

      mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
      
      // Close sidebar when clicking outside on mobile
      const handleDocumentClick = (e: Event) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target as Node) && 
            !mobileMenuToggle.contains(e.target as Node)) {
          sidebar.classList.remove('mobile-open');
        }
      };

      document.addEventListener('click', handleDocumentClick);
      
      // Close sidebar when clicking nav links on mobile
      const navLinks = document.querySelectorAll('.nav-link');
      const handleNavClick = () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('mobile-open');
        }
      };

      navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
      });

      // Cleanup
      return () => {
        document.removeEventListener('click', handleDocumentClick);
        navLinks.forEach(link => {
          link.removeEventListener('click', handleNavClick);
        });
      };
    }

    const cleanup = setupMobileMenu();

    return () => {
      cleanup?.();
    };
  }, []);

  return null; // This component doesn't render anything
} 