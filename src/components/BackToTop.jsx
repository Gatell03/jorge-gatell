import { useEffect, useRef, useState } from 'react';

// Aparece al volver a subir (scroll hacia arriba) una vez pasados 300px.
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      // Con el footer a la vista ya está su enlace "Volver arriba": no duplicarlo
      const footerTop = document.getElementById('contacto')?.getBoundingClientRect().top ?? Infinity;
      const nearBottom = footerTop < window.innerHeight;
      setIsVisible(y < lastScrollY.current && y > 300 && !nearBottom);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-5 py-2 bg-card border border-ink rounded-full font-medium shadow-md transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      Volver arriba
    </button>
  );
};

export default BackToTop;
