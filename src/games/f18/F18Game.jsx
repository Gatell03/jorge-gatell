import { useEffect, useRef, useState } from 'react';
import GameShell from '../shared/GameShell';
import { useRecord } from '../shared/useRecord';
import { F18Engine, MEDALS } from './engine';

export const F18_RECORD_KEY = 'f18-record';

const Card = ({ children }) => (
  <div className="photo-print bg-[#f1ebdd] p-8 max-w-sm w-full text-center -rotate-1 animate-fade-in flex flex-col items-center gap-3">
    {children}
  </div>
);

const PrimaryButton = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative mt-3 inline-flex items-center gap-2 px-8 py-3 font-medium"
  >
    <span className="absolute -inset-x-2 -inset-y-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
      <img src="/contact.webp" alt="" className="w-full h-full object-fill" />
    </span>
    <span className="relative">{children}</span>
    <span aria-hidden="true" className="relative transition-transform group-hover:translate-x-1">→</span>
  </button>
);

const Stage = ({ full }) => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [mode, setMode] = useState('menu');
  const [final, setFinal] = useState({ score: 0, isRecord: false });
  const [record, submitRecord] = useRecord(F18_RECORD_KEY);

  // Motor + bucle de dibujo (vive mientras el componente esté montado)
  useEffect(() => {
    const engine = new F18Engine({
      onDeath: (score) => {
        setFinal({ score, isRecord: submitRecord(score) });
        setMode('over');
      },
    });
    engineRef.current = engine;
    if (import.meta.env.DEV) window.__f18 = engine; // para depurar desde la consola
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const fit = () => {
      const { width, height } = boxRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.resize(width, height);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(boxRef.current);

    let raf;
    let last = performance.now();
    let lastMode = engine.mode;
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      engine.update(dt);
      engine.draw(ctx);
      if (engine.mode !== lastMode) {
        lastMode = engine.mode;
        setMode(engine.mode);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVisibility = () => document.hidden && engine.pause(true);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [submitRecord]);

  const start = () => {
    engineRef.current.start();
    setMode('countdown');
    boxRef.current.focus({ preventScroll: true });
  };

  const onPointerDown = (e) => {
    if (e.target.closest('button')) return;
    const engine = engineRef.current;
    if (engine.mode === 'playing') engine.flap();
    else if (engine.mode === 'menu' || engine.mode === 'over') start();
    else if (engine.mode === 'paused') engine.pause(false);
  };

  const onKeyDown = (e) => {
    const engine = engineRef.current;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
      e.preventDefault();
      if (engine.mode === 'playing') engine.flap();
      else if (engine.mode === 'paused') engine.pause(false);
      else if (engine.mode !== 'countdown') start();
    } else if (e.code === 'KeyP' || e.code === 'Escape') {
      engine.pause(engine.mode === 'playing');
    }
  };

  const medal = MEDALS.find((m) => final.score >= m.min);

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      role="application"
      aria-label="Juego: el vuelo del F-18"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={`relative w-full overflow-hidden border-2 border-ink shadow-xl cursor-pointer select-none touch-none outline-none ${
        full ? 'h-dvh max-w-none border-0' : 'h-[min(72vh,620px)] min-h-[420px]'
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute top-3 right-4 text-xs uppercase tracking-[0.14em] text-ink-soft pointer-events-none">
        Récord {record}
      </div>

      {mode === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-ink/10">
          <Card>
            <h2 className="text-3xl font-serif font-light">Misión asignada</h2>
            <p className="text-ink-soft">Esquiva los muros, recoge estrellas (+2) y cafés (escudo). Rozar un muro sin tocarlo da punto extra.</p>
            <PrimaryButton onClick={start}>Despegar</PrimaryButton>
            <p className="text-xs text-ink-soft">Espacio / clic para volar · P para pausar</p>
          </Card>
        </div>
      )}

      {mode === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-ink/20">
          <Card>
            <h2 className="text-3xl font-serif font-light">En pausa</h2>
            <PrimaryButton onClick={() => engineRef.current.pause(false)}>Seguir</PrimaryButton>
          </Card>
        </div>
      )}

      {mode === 'over' && (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-ink/25">
          <Card>
            <h2 className="text-3xl font-serif font-light">¡Impacto!</h2>
            <p className="text-6xl font-serif font-light leading-none">{final.score}</p>
            {medal ? (
              <p className="flex items-center gap-2 text-sm uppercase tracking-[0.14em]">
                <span className="w-4 h-4 rounded-full ring-1 ring-ink/40" style={{ background: medal.color }} />
                Medalla de {medal.name.toLowerCase()}
              </p>
            ) : (
              <p className="text-sm text-ink-soft">Llega a 10 para tu primera medalla</p>
            )}
            {final.isRecord && <p className="font-serif italic text-xl hand-underline">¡Nuevo récord!</p>}
            <PrimaryButton onClick={start}>Reintentar misión</PrimaryButton>
          </Card>
        </div>
      )}
    </div>
  );
};

const F18Game = () => (
  <GameShell title="El vuelo del F-18" subtitle="Esquiva bugs y deadlines, recoge estrellas y cafés. Toca, haz clic o pulsa espacio para volar.">
    {({ full }) => <Stage full={full} />}
  </GameShell>
);

export default F18Game;
