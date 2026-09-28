import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import AnimatedDrawing from './AnimatedDrawing';
import { openContact } from './contact';

const underline = (active) =>
  `absolute bottom-0 left-0 w-full h-[1.5px] bg-ink transition-transform duration-300 ease-in-out ${
    active ? 'scale-x-100 origin-left' : 'scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left'
  }`;

const AnimatedLink = ({ to, end, children, onClick }) => (
  <NavLink to={to} end={end} onClick={onClick} className="relative py-1 group">
    {({ isActive }) => (
      <>
            <span>{children}</span>
            <span className={underline(isActive)} />
  
    </>
    )}
  </NavLink>
);

const ContactButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="relative group inline-flex items-center justify-center px-5 py-2 font-medium"
  >
    <span className="absolute -inset-x-1 -inset-y-0.5 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-500">
      <img src="/contact.webp" alt="" className="w-full h-full object-fill" />
    </span>
    <span className="relative z-10">contacto</span>
  </button>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // En inicio el menú es fijo: arriba del todo, normal; en cuanto hay scroll, tira fina de acrílico.
  // En el resto de páginas (cortas) se queda arriba y se va con la página al bajar.
  const [isScrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const { pathname } = useLocation();
  const sticky = pathname === '/';
  const scrolled = sticky && isScrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar el menú móvil con Escape o tocando fuera
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && setIsOpen(false);
    const onClick = (e) => !menuRef.current?.contains(e.target) && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onClick);
    };
  }, [isOpen]);

  const goToContact = () => {
    setIsOpen(false);
    openContact();
  };

  const goHome = (e) => {
    setIsOpen(false);
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const links = (
    <>
      <AnimatedLink to="/" end onClick={goHome}>inicio</AnimatedLink>
      <AnimatedLink to="/about" onClick={() => setIsOpen(false)}>sobre mí</AnimatedLink>
      <AnimatedLink to="/play" onClick={() => setIsOpen(false)}>jugar</AnimatedLink>
      <ContactButton onClick={goToContact} />
    </>
  );

  return (
    <>
      {/* Hueco con la altura original del menú: como el menú es fijo, puede encogerse al hacer
          scroll sin mover la página (si la moviera, el scroll entraría en bucle y temblaría) */}
      <div aria-hidden="true" className="h-[104px] md:h-[112px]" />
      <nav
        ref={menuRef}
        className={`page ${sticky ? 'fixed' : 'absolute'} top-0 inset-x-0 z-50 flex items-center justify-between transition-[height,background,box-shadow] duration-300 ${
          scrolled ? 'h-12 nav-glass' : 'h-[104px] md:h-[112px]'
        }`}
      >
        <Link
          to="/"
          onClick={goHome}
          aria-label="Inicio"
          className="-rotate-6 hover:rotate-6 transition-transform duration-500"
        >
          <AnimatedDrawing className={`h-auto transition-[width] duration-300 ${scrolled ? 'w-8' : 'w-14 md:w-16'}`} />
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
          aria-controls="menu-movil"
          className="md:hidden p-2 -mr-2"
        >
          <svg className={`transition-[width,height] duration-300 ${scrolled ? 'w-6 h-6' : 'w-7 h-7'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {isOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
          </svg>
        </button>

        <div className={`hidden md:flex items-center gap-10 font-medium tracking-wide transition-[font-size] duration-300 ${scrolled ? 'text-sm' : 'text-base'}`}>{links}</div>

        {isOpen && (
          <div
            id="menu-movil"
            className="absolute top-full inset-x-4 bg-card rounded-sm shadow-xl border border-line flex flex-col items-center gap-6 py-8 text-lg font-medium md:hidden animate-fade-in"
          >
            {links}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
