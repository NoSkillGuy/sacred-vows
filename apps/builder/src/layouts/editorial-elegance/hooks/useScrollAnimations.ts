import { useEffect, useRef } from 'react';

/**
 * Hook for scroll-triggered animations using Intersection Observer
 * Adds 'ee-visible' class when elements enter viewport
 */
export function useScrollAnimations(): void {
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Check if user prefers reduced motion or if we're in edit mode (show immediately)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isEditMode = document.querySelector('[data-edit-mode="true"]') !== null;
      
      // Always make sections visible immediately in edit mode or if reduced motion is preferred
      // In view mode, use Intersection Observer for scroll animations
      if (prefersReducedMotion || isEditMode) {
        // Skip animations, make everything visible immediately
        const elements = document.querySelectorAll('.ee-section, .ee-event-card, .ee-gallery-item');
        elements.forEach(el => el.classList.add('ee-visible'));
        return;
      }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px', // Trigger when element is 100px from bottom of viewport
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ee-visible');
          // Unobserve after animation to improve performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all sections and cards
    const sections = document.querySelectorAll('.ee-section');
    const eventCards = document.querySelectorAll('.ee-event-card');
    const galleryItems = document.querySelectorAll('.ee-gallery-item');

    [...sections, ...eventCards, ...galleryItems].forEach(el => {
      observer.observe(el);
    });

      return () => {
        observer.disconnect();
      };
    }, 100); // 100ms delay to ensure DOM is ready
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
}

/**
 * Hook for parallax effect on hero image
 * Very slow, sophisticated parallax
 */
export function useParallax(): React.RefObject<HTMLDivElement> {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion || !heroRef.current) {
      return;
    }

    const heroImage = heroRef.current.querySelector('.ee-hero-image') as HTMLElement;
    if (!heroImage) return;

    let ticking = false;

    const handleScroll = (): void => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const heroHeight = heroRef.current?.offsetHeight || 0;
          
          // Only apply parallax within hero section
          if (scrolled < heroHeight) {
            // Very slow parallax (0.3 factor for subtlety)
            const parallaxValue = scrolled * 0.3;
            heroImage.style.transform = `translateY(${parallaxValue}px)`;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return heroRef;
}

