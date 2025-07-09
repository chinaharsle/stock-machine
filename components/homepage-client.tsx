"use client";

import { useEffect, useState } from 'react';
import { formatSpecificationLabel } from '@/lib/data';
import { useToast } from './ui/toast';

interface HomepageClientProps {
  onQuoteClick?: (model: string, specifications: Record<string, string>) => void;
  onImageClick?: (images: string[], startIndex: number) => void;
}

export function HomepageClient({ }: HomepageClientProps) {
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quoteModalData, setQuoteModalData] = useState<{
    model: string;
    specifications: Record<string, string>;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, ToastContainer } = useToast();

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

    // Setup Modal Event Listeners
    function setupModalEventListeners() {
      const quoteModal = document.getElementById('quoteModal');
      const imageModal = document.getElementById('imageModal');
      const quoteForm = document.getElementById('quoteForm');

      // Quote modal close
      const quoteModalClose = quoteModal?.querySelector('.close');
      quoteModalClose?.addEventListener('click', closeQuoteModal);

      // Image modal close
      const imageModalClose = imageModal?.querySelector('.close');
      imageModalClose?.addEventListener('click', closeImageModal);

      // Quote form submission - 移除之前的监听器以防止重复绑定
      quoteForm?.removeEventListener('submit', handleQuoteSubmission);
      quoteForm?.addEventListener('submit', handleQuoteSubmission);

      // Image navigation
      const prevButton = document.getElementById('prevImage');
      const nextButton = document.getElementById('nextImage');
      const prevHandler = () => navigateImage(-1);
      const nextHandler = () => navigateImage(1);
      
      prevButton?.addEventListener('click', prevHandler);
      nextButton?.addEventListener('click', nextHandler);

      // Modal outside click
      const handleOutsideClick = (e: MouseEvent) => {
        if (e.target === quoteModal) closeQuoteModal();
        if (e.target === imageModal) closeImageModal();
      };

      // Keyboard events
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeQuoteModal();
          closeImageModal();
        }
        if (imageModal?.style.display === 'block') {
          if (e.key === 'ArrowLeft') navigateImage(-1);
          if (e.key === 'ArrowRight') navigateImage(1);
        }
      };

      window.addEventListener('click', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        // 清理所有事件监听器
        quoteModalClose?.removeEventListener('click', closeQuoteModal);
        imageModalClose?.removeEventListener('click', closeImageModal);
        quoteForm?.removeEventListener('submit', handleQuoteSubmission);
        prevButton?.removeEventListener('click', prevHandler);
        nextButton?.removeEventListener('click', nextHandler);
        window.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }

    function closeQuoteModal() {
      const quoteModal = document.getElementById('quoteModal');
      if (quoteModal) {
        quoteModal.style.display = 'none';
        setQuoteModalData(null);
      }
    }

    function closeImageModal() {
      const imageModal = document.getElementById('imageModal');
      if (imageModal) {
        imageModal.style.display = 'none';
        setCurrentImages([]);
        setCurrentImageIndex(0);
      }
    }

    function navigateImage(direction: number) {
      if (currentImages.length === 0) return;
      
      const newIndex = (currentImageIndex + direction + currentImages.length) % currentImages.length;
      setCurrentImageIndex(newIndex);
      
      const modalImage = document.getElementById('modalImage') as HTMLImageElement;
      if (modalImage) {
        modalImage.src = currentImages[newIndex];
      }
    }

    async function handleQuoteSubmission(e: Event) {
      e.preventDefault();
      
      // 防止重复提交
      if (isSubmitting) {
        return;
      }
      
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      // Simple form validation
      const fullName = formData.get('fullName') as string;
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string;
      const message = formData.get('message') as string;
      const company = formData.get('company') as string;
      
      if (!fullName || !email || !phone || !message) {
        showToast('Please fill in all required fields', 'warning');
        return;
      }

      // 设置提交状态
      setIsSubmitting(true);
      const submitBtn = form.querySelector('.submit-btn') as HTMLButtonElement;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;
      
      try {
        // 获取客户IP地址和国家信息
        let ipAddress = '';
        let country = '';
        
        try {
          // 尝试多个IP地址API服务以提高可靠性
          const ipAPIs = [
            'https://ipapi.co/json/',
            'https://ipwhois.app/json/',
            'https://httpbin.org/ip'
          ];
          
          for (const apiUrl of ipAPIs) {
            try {
              const ipResponse = await fetch(apiUrl);
              const data = await ipResponse.json();
              
              if (apiUrl.includes('ipapi.co')) {
                ipAddress = data.ip || '';
                country = data.country_name || '';
                break;
              } else if (apiUrl.includes('ipwhois.app')) {
                ipAddress = data.ip || '';
                country = data.country || '';
                break;
              } else if (apiUrl.includes('httpbin.org')) {
                ipAddress = data.origin || '';
                // httpbin.org不提供国家信息，继续尝试下一个API
                continue;
              }
            } catch {
              console.log(`Failed to fetch from ${apiUrl}, trying next...`);
              continue;
            }
          }
          
          console.log('IP Info collected:', { ipAddress, country });
        } catch {
          console.error('Error getting IP info:');
          // 继续提交，即使IP获取失败
        }

        // 准备询盘数据
        const inquiryData = {
          fullName,
          email,
          phone,
          company: company || undefined,
          message,
          productModel: quoteModalData?.model || undefined,
          ipAddress,
          country
        };

        // 调用Next.js API路由
        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inquiryData })
        });

        const result = await response.json();

        if (result.success) {
          showToast('Thank you for your inquiry! We will contact you soon.', 'success');
          closeQuoteModal();
          form.reset();
        } else {
          throw new Error(result.error || 'Failed to submit inquiry');
        }
      } catch (error) {
        console.error('Error submitting inquiry:', error);
        showToast('Sorry, there was an error submitting your inquiry. Please try again or contact us directly.', 'error');
      } finally {
        // 恢复按钮状态和提交状态
        setIsSubmitting(false);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }

    // Initialize everything
    initializeHeroSlider();
    const cleanupBackToTop = setupBackToTop();
    const cleanupModals = setupModalEventListeners();

    // Cleanup function
    return () => {
      clearInterval(heroSlideInterval);
      cleanupBackToTop?.();
      cleanupModals?.();
    };
  }, [currentImages, currentImageIndex, quoteModalData, showToast, isSubmitting]);

  // Handle quote modal opening
  const handleQuoteClick = (model: string, specifications: Record<string, string>) => {
    setQuoteModalData({ model, specifications });
    
    // Update modal content
    const quoteModal = document.getElementById('quoteModal');
    const quoteProductInfo = document.getElementById('quoteProductInfo');
    const productDisplayInfo = document.getElementById('productDisplayInfo');
    const productModelInput = document.getElementById('productModel') as HTMLInputElement;
    
    if (quoteModal && quoteProductInfo && productDisplayInfo && productModelInput) {
      // Show product info
      quoteProductInfo.style.display = 'block';
      
      // Update product info
      productDisplayInfo.innerHTML = `
        <div class="product-spec">
          <span class="spec-label">Model:</span>
          <span class="spec-value">${model}</span>
        </div>
        ${Object.entries(specifications).map(([key, value]) => `
          <div class="product-spec">
            <span class="spec-label">${formatSpecificationLabel(key)}:</span>
            <span class="spec-value">${value}</span>
          </div>
        `).join('')}
      `;
      
      // Set hidden field
      productModelInput.value = model;
      
      // Show modal
      quoteModal.style.display = 'block';
    }
  };

  // Handle image modal opening
  const handleImageClick = (images: string[], startIndex: number) => {
    setCurrentImages(images);
    setCurrentImageIndex(startIndex);
    
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage') as HTMLImageElement;
    
    if (imageModal && modalImage) {
      modalImage.src = images[startIndex];
      imageModal.style.display = 'block';
    }
  };

  // Expose functions globally for the machine cards to use
  useEffect(() => {
    (window as typeof window & { openQuoteModal: typeof handleQuoteClick }).openQuoteModal = handleQuoteClick;
    (window as typeof window & { openImageModal: typeof handleImageClick }).openImageModal = handleImageClick;
  }, []);

  return <ToastContainer />;
} 