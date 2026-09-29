import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { isMuted, onMuteChange, setMuted } from './sound';
import { usePageTitle } from '../../components/usePageTitle';

const IconButton = ({ label, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="p-2 rounded-full border border-ink/25 hover:border-ink hover:bg-card/60 transition-colors"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  </button>
);

// Marco común de los juegos: volver, título, silencio y pantalla completa
const GameShell = ({ title, subtitle, children }) => {
  usePageTitle(title);
  const stageRef = useRef(null);
  const [muted, setMutedState] = useState(isMuted);
  const [nativeFull, setNativeFull] = useState(false);
  // iPhone (Safari) no deja poner en pantalla completa nada que no sea un vídeo:
  // allí el juego ocupa toda la ventana desde la propia web
  const [fakeFull, setFakeFull] = useState(false);
  const full = nativeFull || fakeFull;

  useEffect(() => onMuteChange(setMutedState), []);
  useEffect(() => {
    const onChange = () =>
      setNativeFull((document.fullscreenElement ?? document.webkitFullscreenElement) === stageRef.current);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  // Pantalla completa simulada: sin scroll de la página por debajo y Escape para salir
  useEffect(() => {
    if (!fakeFull) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setFakeFull(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [fakeFull]);

  const toggleFull = () => {
    if (fakeFull) return setFakeFull(false);
    if (document.fullscreenElement) return document.exitFullscreen();
    if (document.webkitFullscreenElement) return document.webkitExitFullscreen();
    const stage = stageRef.current;
    const request = stage?.requestFullscreen ?? stage?.webkitRequestFullscreen;
    if (!request) return setFakeFull(true);
    Promise.resolve(request.call(stage)).catch(() => setFakeFull(true));
  };

  return (
    <div className="page flex flex-col gap-8 pt-6 md:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-6">
        <div className="flex flex-col gap-3">
          <Link to="/play" className="text-sm text-ink-soft hover:text-ink transition-colors">← Juegos</Link>
          <h1 className="text-4xl md:text-7xl font-serif font-light tracking-tight leading-none">{title}</h1>
          <p className="text-ink-soft">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <IconButton label={muted ? 'Activar sonido' : 'Silenciar'} onClick={() => setMuted(!muted)}>
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
            {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
          </IconButton>
          <IconButton label={full ? 'Salir de pantalla completa' : 'Pantalla completa'} onClick={toggleFull}>
            {full ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
          </IconButton>
        </div>
      </header>
      <div
        ref={stageRef}
        className={`w-full ${full ? 'bg-paper flex items-center justify-center' : 'relative'} ${
          fakeFull ? 'fixed inset-0 z-[200] h-dvh' : ''
        }`}
      >
        {typeof children === 'function' ? children({ full }) : children}
        {fakeFull && (
          <button
            type="button"
            onClick={() => setFakeFull(false)}
            aria-label="Salir de pantalla completa"
            className="absolute left-1/2 -translate-x-1/2 z-30 p-2 rounded-full bg-card/85 border border-ink/30 shadow-md"
            style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default GameShell;
