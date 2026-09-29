import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import AnimatedDrawing from './AnimatedDrawing';
import { openContact } from './contact';

const CLOSE_MS = 380; // lo que tarda el pósit en despegarse (postit-peel)

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
    <span className="absolute -inset-x-1 -inset-y-0.5 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-500">
      <img src="/contact.webp" alt="" className="w-full h-full object-fill" />
    </span>
    <span className="relative z-10">contacto</span>
  </button>
);

// Enlace del pósit (móvil): la página actual va en cursiva con un punto de tinta
const NoteLink = ({ to, end, onClick, style, children }) => (
  <NavLink to={to} end={end} onClick={onClick} style={style} className="animate-line block py-2.5 border-b border-ink/15">
    {({ isActive }) => (
      <>
        <span className={isActive ? 'italic' : ''}>{children}</span>
        {isActive && <span aria-hidden="true" className="inline-block ml-2.5 w-1.5 h-1.5 rounded-full bg-ink align-middle" />}
      </>
    )}
  </NavLink>
);

// Botón del menú móvil: un pósit pequeño con tres renglones que se convierten en una X
const NoteButton = ({ open, small, ...props }) => (
  <button
    type="button"
    {...props}
    className={`md:hidden relative -mr-1 transition-[width,height,transform] duration-300 active:scale-95 ${
      small ? 'w-8 h-8' : 'w-10 h-10'
    } ${open ? 'rotate-[8deg]' : '-rotate-[5deg]'}`}
  >
    <span
      className="absolute inset-0 bg-[#fbe78a] shadow-[0_1px_2px_rgb(31_27_22/0.25),0_6px_12px_-6px_rgb(31_27_22/0.4)]"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 72%, 72% 100%, 0 100%)' }}
    />
    <span className="absolute right-0 bottom-0 w-[28%] h-[28%] bg-[#e9cf55]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
    <svg className="absolute inset-0 m-auto w-[62%] h-[62%]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <path className="transition-[d] duration-300" d={open ? 'M6 6l12 12' : 'M5 7h14'} />
      <path className={`transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} d="M5 12h14" />
      <path className="transition-[d] duration-300" d={open ? 'M18 6L6 18' : 'M5 17h9'} />
    </svg>
  </button>
);

const Navbar = () => {
  // closed → open → closing (el pósit se despega) → closed
  const [menu, setMenu] = useState('closed');
  const isOpen = menu === 'open';
  const closeTimer = useRef(null);
  const closeMenu = useCallback(() => {
    clearTimeout(closeTimer.current);
    setMenu((m) => (m === 'closed' ? m : 'closing'));
    closeTimer.current = setTimeout(() => setMenu('closed'), CLOSE_MS);
  }, []);
  const toggleMenu = () => {
    if (isOpen) return closeMenu();
    clearTimeout(closeTimer.current);
    setMenu('open');
  };
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
    const onKey = (e) => e.key === 'Escape' && closeMenu();
    const onClick = (e) => !menuRef.current?.contains(e.target) && closeMenu();
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onClick);
    };
  }, [isOpen, closeMenu]);

  const goToContact = () => {
    closeMenu();
    openContact();
  };

  const goHome = (e) => {
    closeMenu();
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const links = (
    <>
      <AnimatedLink to="/" end onClick={goHome}>inicio</AnimatedLink>
      <AnimatedLink to="/about" onClick={closeMenu}>sobre mí</AnimatedLink>
      <AnimatedLink to="/play" onClick={closeMenu}>jugar</AnimatedLink>
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
          className="-rotate-6 hover:rotate-6 active:rotate-12 transition-transform duration-500"
        >
          <AnimatedDrawing className={`h-auto transition-[width] duration-300 ${scrolled ? 'w-8' : 'w-14 md:w-16'}`} />
        </Link>

        <NoteButton
          open={isOpen}
          small={scrolled}
          onClick={toggleMenu}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
          aria-controls="menu-movil"
        />

        <div className={`hidden md:flex items-center gap-10 font-medium tracking-wide transition-[font-size] duration-300 ${scrolled ? 'text-sm' : 'text-base'}`}>{links}</div>

        {menu !== 'closed' && (
          <div
            id="menu-movil"
            className={`postit ${menu === 'closing' ? 'animate-postit-out' : 'animate-postit'} absolute top-full right-4 mt-1 w-[min(15rem,calc(100vw-2rem))] px-6 pt-8 pb-7 md:hidden`}
          >
            <img
              src="/tape.webp"
              alt=""
              aria-hidden="true"
              className={`${menu === 'closing' ? 'animate-tape-out' : 'animate-tape'} absolute -top-3.5 left-1/2 -ml-12 w-24 pointer-events-none drop-shadow-sm`}
              style={{ '--tape-rot': '-4deg', animationDelay: menu === 'closing' ? '0s' : '0.3s' }}
            />
            <p className="animate-line font-sans text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft mb-1" style={{ animationDelay: '0.35s' }}>
              Menú
            </p>
            <div className="flex flex-col font-serif text-2xl font-light">
              <NoteLink to="/" end onClick={goHome} style={{ animationDelay: '0.42s' }}>inicio</NoteLink>
              <NoteLink to="/about" onClick={closeMenu} style={{ animationDelay: '0.5s' }}>sobre mí</NoteLink>
              <NoteLink to="/play" onClick={closeMenu} style={{ animationDelay: '0.58s' }}>jugar</NoteLink>
              <button
                type="button"
                onClick={goToContact}
                className="animate-line relative self-start mt-4 -ml-2 px-3 py-1 font-sans text-base font-medium"
                style={{ animationDelay: '0.66s' }}
              >
                <img src="/contact.webp" alt="" className="absolute inset-0 w-full h-full object-fill" />
                <span className="relative">escríbeme →</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
