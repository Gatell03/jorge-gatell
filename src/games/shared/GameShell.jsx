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
  const [full, setFull] = useState(false);

  useEffect(() => onMuteChange(setMutedState), []);
  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen?.();
  };

  return (
    <div className="page flex flex-col gap-8 pt-6 md:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-6">
        <div className="flex flex-col gap-3">
          <Link to="/play" className="text-sm text-ink-soft hover:text-ink transition-colors">← Juegos</Link>
          <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight leading-none">{title}</h1>
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
      <div ref={stageRef} className={`relative w-full ${full ? 'bg-paper flex items-center justify-center' : ''}`}>
        {typeof children === 'function' ? children({ full }) : children}
      </div>
    </div>
  );
};

export default GameShell;
