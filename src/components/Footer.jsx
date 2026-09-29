import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm, ValidationError } from '@formspree/react';
import { OPEN_CONTACT_EVENT } from './contact';
import { useLiveOnScroll } from './useLiveOnScroll';

const EMAIL = 'jorgegatell3@gmail.com';
const labelClass = 'text-xs uppercase tracking-[0.14em] text-ink-soft font-medium';

// Renglones de cuaderno: misma altura de línea que el texto del mensaje (2.25rem)
const RULED = {
  backgroundImage: 'repeating-linear-gradient(transparent 0 calc(2.25rem - 1px), rgb(31 27 22 / 0.16) calc(2.25rem - 1px) 2.25rem)',
  lineHeight: '2.25rem',
};

// Campo en línea dentro de una frase ("Me llamo ____")
const InlineInput = ({ id, errors, className = '', ...props }) => (
  <span className="inline-flex flex-col align-baseline max-w-full">
    <input
      id={id}
      name={id}
      required
      className={`bg-transparent border-b-[1.5px] border-dashed border-ink/40 focus:border-solid focus:border-ink outline-none px-1 max-w-full font-serif italic text-ink placeholder:text-ink-soft/50 transition-colors ${className}`}
      {...props}
    />
    <ValidationError field={id} errors={errors} className="text-sm not-italic text-red-700" />
  </span>
);

// Botón con el mismo rotulador amarillo animado que "contacto"
const ScribbleButton = ({ children, ...props }) => (
  <button
    {...props}
    className="group relative inline-flex items-center gap-2 px-8 py-3.5 font-medium text-ink disabled:opacity-60 focus-visible:outline-none"
  >
    {/* Igual que "contacto": el rotulador solo aparece al pasar el ratón */}
    <span className="absolute -inset-x-2 -inset-y-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-300">
      <img src="/contact.webp" alt="" className="w-full h-full object-fill" />
    </span>
    <span className="relative">{children}</span>
    <span aria-hidden="true" className="relative transition-transform duration-300 group-hover:translate-x-1.5">→</span>
  </button>
);

const PaperPlane = () => (
  <svg className="animate-plane w-14 h-14 text-ink" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 22 44 6 34 42 22 28Z" fill="var(--color-card)" />
    <path d="M44 6 22 28v12l5-8" />
  </svg>
);

const LetterTape = ({ side, closing }) => (
  <img
    src="/tape.webp"
    alt=""
    aria-hidden="true"
    className={`${closing ? 'animate-tape-out' : 'animate-tape'} absolute -top-4 w-20 md:w-28 pointer-events-none drop-shadow-sm ${side === 'left' ? '-left-3 md:-left-6' : '-right-3 md:-right-6'}`}
    style={{ '--tape-rot': side === 'left' ? '-32deg' : '28deg' }}
  />
);

const ContactForm = ({ onClose, closing }) => {
  const [state, handleSubmit] = useForm('xykoqopw');
  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const line = (i) => ({ animationDelay: `${0.45 + i * 0.08}s` });

  return (
    <div className={`${closing ? 'animate-letter-out' : 'animate-letter'} photo-print bg-[#f1ebdd] max-w-3xl px-5 py-9 md:px-14 md:py-14`}>
      <LetterTape side="left" closing={closing} />
      <LetterTape side="right" closing={closing} />

      {state.succeeded ? (
        <div className="flex flex-col items-start gap-5 animate-fade-in">
          <PaperPlane />
          <h3 className="text-4xl font-serif font-light">¡Carta enviada!</h3>
          <p className="text-lg text-ink-soft max-w-md">
            Gracias por escribir. Te responderé lo antes posible (si no estoy depurando código o entrenando).
          </p>
          <button type="button" onClick={onClose} className="text-sm font-medium underline underline-offset-4">
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-7 font-serif text-lg md:text-2xl font-light leading-relaxed">
          {/* Campo trampa de Formspree: invisible para personas, los bots lo rellenan y se descartan */}
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] w-px h-px opacity-0" />
          <div className="animate-line flex flex-wrap justify-between gap-x-4 gap-y-1 font-sans" style={line(0)}>
            <span className={labelClass}>Para: Jorge Gatell</span>
            <span className={labelClass}>Zaragoza, {today}</span>
          </div>

          <p className="animate-line italic" style={line(1)}>Querido Jorge:</p>

          <p className="animate-line" style={line(2)}>
            Me llamo{' '}
            <InlineInput id="name" errors={state.errors} placeholder="tu nombre" autoComplete="name" size={16} />{' '}
            y puedes responderme a{' '}
            <InlineInput id="email" type="email" errors={state.errors} placeholder="tu@email.com" autoComplete="email" size={20} />.
          </p>

          <p className="animate-line" style={line(3)}>
            Te escribo sobre <InlineInput id="subject" errors={state.errors} placeholder="el motivo" size={24} />.
          </p>

          <div className="animate-line flex flex-col" style={line(4)}>
            <label htmlFor="message" className="sr-only">Mensaje</label>
            <textarea
              id="message"
              name="message"
              required
              rows="4"
              placeholder="Cuéntame lo que quieras. ¿Un software que cure el hipo? ¿Un algoritmo que encuentre calcetines desparejados? ¿O me invitas a una tortilla de patatas? Soy todo oídos (y código)."
              className="bg-transparent outline-none resize-none text-base md:text-xl placeholder:text-ink-soft/50"
              style={RULED}
            />
            <ValidationError field="message" errors={state.errors} className="text-sm text-red-700" />
          </div>

          <div className="animate-line flex flex-wrap items-end justify-between gap-6 pt-2" style={line(5)}>
            <p className="italic">Un saludo,</p>
            <ScribbleButton type="submit" disabled={state.submitting}>
              {state.submitting ? 'Enviando…' : 'Enviar carta'}
            </ScribbleButton>
          </div>
          <ValidationError errors={state.errors} className="text-sm text-red-700 font-sans" />
        </form>
      )}
    </div>
  );
};

const CopyButton = () => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* sin permiso de portapapeles: no hacemos nada */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Email copiado' : 'Copiar email'}
      title={copied ? 'Copiado' : 'Copiar email'}
      className="p-1.5 text-ink-soft hover:text-ink transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {copied ? (
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        ) : (
          <>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V6a2 2 0 0 1 2-2h8" />
          </>
        )}
      </svg>
    </button>
  );
};

// Espera a que termine un scroll suave (o a que pase un tiempo máximo)
// Termina al llegar al destino, o cuando ya se movió y se ha parado (tope: 1,6 s)
const waitForScroll = (target) =>
  new Promise((resolve) => {
    let last = window.scrollY;
    let still = 0;
    let moved = false;
    const started = performance.now();
    const timer = setInterval(() => {
      const y = window.scrollY;
      if (y !== last) moved = true;
      still = y === last ? still + 1 : 0;
      last = y;
      const arrived = Math.abs(y - target) < 4;
      if (arrived || (moved && still >= 3) || performance.now() - started > 1600) {
        clearInterval(timer);
        resolve();
      }
    }, 40);
  });

const UNFOLD_MS = 1000; // lo que tarda la carta en desplegarse (letter-unfold + líneas)
const CLOSE_MS = 920; // cinta (0,3 s) + plegado (0,2 s de espera + 0,7 s)

const Footer = () => {
  // closed → reserving (carta montada en pausa, ocupa su hueco) → open (se despliega) → closing (se pliega)
  const [phase, setPhase] = useState('closed');
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const phaseRef = useRef('closed');
  const focusRef = useRef(false);
  const rowRef = useRef(null);
  const letterRef = useRef(null);
  const showForm = phase !== 'closed';
  const emailRef = useLiveOnScroll('0px 0px -20% 0px');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Baja lo justo para que la carta se vea entera
  const revealLetter = useCallback(() => {
    const el = letterRef.current;
    if (!el) return;
    const bottom = el.getBoundingClientRect().bottom + window.scrollY + 24;
    window.scrollTo({ top: Math.max(window.scrollY, bottom - window.innerHeight), behavior: 'smooth' });
  }, []);

  // Secuencia: reservar hueco → bajar hasta el email → desplegar la carta a la vista
  const openLetter = useCallback(async (focus) => {
    focusRef.current = focus;
    if (phaseRef.current === 'open') {
      revealLetter();
      if (focus) setTimeout(() => document.getElementById('name')?.focus({ preventScroll: true }), 500);
      return;
    }
    if (phaseRef.current === 'reserving' || phaseRef.current === 'closing') return;
    setPhase('reserving');
    // Esperar a que el hueco termine de abrirse (transición de 500 ms) para poder bajar hasta él
    await new Promise((r) => setTimeout(r, 520));
    const row = rowRef.current;
    const top = row.getBoundingClientRect().top + window.scrollY - Math.min(140, window.innerHeight * 0.15);
    if (Math.abs(top - window.scrollY) > 8) {
      window.scrollTo({ top, behavior: 'smooth' });
      await waitForScroll(Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
    }
    setPhase('open');
  }, [revealLetter]);

  // Cuando termina de desplegarse, encuadrarla y (desde el menú) dejar el cursor en "tu nombre"
  useEffect(() => {
    if (phase !== 'open') return;
    const t = setTimeout(() => {
      revealLetter();
      if (focusRef.current) setTimeout(() => document.getElementById('name')?.focus({ preventScroll: true }), 600);
    }, UNFOLD_MS);
    return () => clearTimeout(t);
  }, [phase, revealLetter]);

  // Cerrar con animación: se despega la cinta, se pliega la carta y luego se recoge el hueco
  const closeLetter = useCallback(() => {
    if (phaseRef.current !== 'open') return;
    setPhase('closing');
    setTimeout(() => setPhase('closed'), CLOSE_MS);
  }, []);

  // Botón "contacto" del menú
  useEffect(() => {
    const open = () => openLetter(true);
    window.addEventListener(OPEN_CONTACT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, open);
  }, [openLetter]);

  // Los enlaces a /contact (redirigen a /#contacto) también abren la carta
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === '#contacto') openLetter(true);
  }, [hash, openLetter]);

  const toggleMap = () => {
    setMapLoaded(true);
    setShowMap((v) => !v);
  };

  return (
    <footer id="contacto" className="w-full pt-16 md:pt-24 flex flex-col gap-8 md:gap-14 border-t border-line mt-24 md:mt-32 scroll-mt-4">
      <h2 className="text-[3.5rem] md:text-[8rem] lg:text-[10rem] font-serif font-light tracking-tighter leading-none">
        Hablemos.
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-10">
        {/* Email: al pulsarlo se despliega la carta */}
        <div ref={emailRef} className="group/email flex flex-col gap-2">
          <span className="relative h-4 overflow-hidden">
            <span className={`block transition-all duration-300 group-hover/email:opacity-0 group-hover/email:-translate-y-full group-data-live/email:opacity-0 group-data-live/email:-translate-y-full group-data-live/email:delay-500 ${labelClass}`}>
              Email
            </span>
            <span className={`absolute inset-0 italic whitespace-nowrap opacity-0 translate-y-full transition-all duration-300 group-hover/email:opacity-100 group-hover/email:translate-y-0 group-data-live/email:opacity-100 group-data-live/email:translate-y-0 group-data-live/email:delay-500 ${labelClass} text-ink`}>
              ¡Púlsame, no muerdo!
            </span>
          </span>
          <div ref={rowRef} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (phase === 'open' ? closeLetter() : openLetter(false))}
              aria-expanded={showForm}
              className="group relative py-1 text-lg md:text-3xl font-medium text-left break-all"
            >
              {EMAIL}
              <span
                className={`absolute bottom-0 left-0 w-full h-[2px] bg-ink transition-transform duration-300 ease-in-out ${
                  showForm ? 'scale-x-100 origin-left' : 'scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left group-data-live/email:scale-x-100 group-data-live/email:origin-left group-data-live/email:delay-700'
                }`}
              />
            </button>
            <CopyButton />
          </div>
        </div>

        {/* Redes y ubicación: en móvil, una fila (redes a un lado, ciudad al otro) */}
        <div className="relative w-full md:w-auto flex flex-row md:flex-col justify-between items-baseline md:items-end gap-4 md:gap-6">
          <div
            className={`photo-print absolute bottom-full right-0 mb-6 w-[min(341px,calc(100vw-3rem))] aspect-[4/3] p-2 rotate-1 transition-all duration-500 origin-bottom ${
              showMap ? 'opacity-100 scale-100' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
            }`}
          >
            {mapLoaded && (
              <iframe
                title="Mapa de Zaragoza"
                loading="lazy"
                src="https://maps.google.com/maps?q=Zaragoza,Spain&z=11&output=embed"
                className="w-full h-full border-0 grayscale contrast-110"
              />
            )}
          </div>

          <div className="flex gap-5 md:gap-6 md:text-xl font-medium">
            <a href="https://www.instagram.com/gatell_/" target="_blank" rel="noopener noreferrer" className="hover:text-ink-soft transition-colors">
              Instagram
            </a>
            <a href="https://www.linkedin.com/in/jorge-gatell-ballesteros-8627821b0/" target="_blank" rel="noopener noreferrer" className="hover:text-ink-soft transition-colors">
              LinkedIn
            </a>
          </div>
          <p className="text-sm md:text-base text-ink-soft">
            Vivo en{' '}
            <button type="button" onClick={toggleMap} aria-expanded={showMap} className="relative group font-medium text-ink">
              Zaragoza
              <span className="absolute -bottom-[2px] left-0 w-full h-px bg-ink scale-x-0 origin-right [@media(hover:none)]:scale-x-100 group-hover:scale-x-100 group-hover:origin-left transition-transform duration-300" />
            </button>
            , España
          </p>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows,margin] duration-500 ease-in-out ${
          showForm ? 'grid-rows-[1fr] mt-4' : 'grid-rows-[0fr] -mt-10 md:-mt-14'
        }`}
      >
        {/* padding para que la cinta y la sombra no se recorten */}
        <div ref={letterRef} className={showForm ? `pt-6 px-2 md:px-6 pb-2 ${phase === 'reserving' ? 'letter-paused' : ''}` : 'overflow-hidden'}>
          {showForm && <ContactForm onClose={closeLetter} closing={phase === 'closing'} />}
        </div>
      </div>

      <div className="grid grid-cols-2 md:flex md:flex-row justify-between gap-x-4 gap-y-2 border-t border-line py-5 md:py-6 text-xs md:text-sm text-ink-soft">
        <span>© {new Date().getFullYear()} Jorge Gatell</span>
        <span className="col-span-2 order-last md:order-none font-serif italic text-center md:text-left">Hecho a mano en Zaragoza</span>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-right hover:text-ink transition-colors"
        >
          Volver arriba ↑
        </button>
      </div>
    </footer>
  );
};

export default Footer;
