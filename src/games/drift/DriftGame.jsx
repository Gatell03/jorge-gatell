import { useEffect, useRef, useState } from 'react';
import GameShell from '../shared/GameShell';
import { readRecord } from '../shared/useRecord';
import { audio } from '../shared/sound';
import { DriftWorld } from './world';
import { createInput } from './input';

export const DRIFT_RECORD_KEY = 'drift-record';
export const DRIFT_TIME_RECORD_KEY = 'drift-time-record';

// Guarda si mejora; devuelve true si es récord
const saveRecord = (key, value) => {
  try {
    if (value > readRecord(key)) {
      localStorage.setItem(key, String(value));
      return true;
    }
  } catch {
    /* sin almacenamiento */
  }
  return false;
};

// Botón con el rotulador amarillo al pasar el ratón (como "contacto")
const ScribbleButton = ({ children, onClick, subtle = false }) => (
  <button type="button" onClick={onClick} className={`group relative inline-flex items-center gap-2 px-7 py-3 font-medium ${subtle ? 'text-ink-soft' : ''}`}>
    <span className="absolute -inset-x-2 -inset-y-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
      <img src="/contact.webp" alt="" className="w-full h-full object-fill" />
    </span>
    <span className="relative">{children}</span>
    <span aria-hidden="true" className="relative transition-transform group-hover:translate-x-1">→</span>
  </button>
);

const formatTime = (t) => `0:${String(Math.ceil(t)).padStart(2, '0')}`;

// Botón táctil que mantiene pulsada una acción mientras el dedo está encima
const TouchButton = ({ label, action, input, className = '', children }) => {
  const set = (v) => (e) => {
    e.preventDefault();
    input.current?.setTouch(action, v);
  };
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={set(true)}
      onPointerUp={set(false)}
      onPointerLeave={set(false)}
      onPointerCancel={set(false)}
      onContextMenu={(e) => e.preventDefault()}
      className={`pointer-events-auto select-none touch-none rounded-full bg-card/80 border border-ink/30 shadow-md active:bg-accent flex items-center justify-center font-medium ${className}`}
    >
      {children}
    </button>
  );
};

const Stat = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">{label}</span>
    <span className="font-serif font-light text-2xl leading-none tabular-nums">{value}</span>
  </div>
);

const Stage = ({ full }) => {
  const boxRef = useRef(null);
  const worldRef = useRef(null);
  const inputRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null); // fin del contrarreloj: { total, isRecord }
  const [timeRecord, setTimeRecord] = useState(() => readRecord(DRIFT_TIME_RECORD_KEY));
  const [hud, setHud] = useState({ current: 0, mult: 1, total: 0, best: readRecord(DRIFT_RECORD_KEY), speed: 0, drifting: false, message: '' });
  const [touch] = useState(() => window.matchMedia?.('(pointer: coarse)').matches);

  useEffect(() => {
    const box = boxRef.current;
    const world = new DriftWorld(box, { onHud: setHud });
    world.setBest(readRecord(DRIFT_RECORD_KEY));
    world.onBest = (value) => saveRecord(DRIFT_RECORD_KEY, value);
    world.onFinish = (total) => {
      const isRecord = saveRecord(DRIFT_TIME_RECORD_KEY, total);
      if (isRecord) setTimeRecord(total);
      setResult({ total, isRecord });
    };
    worldRef.current = world;
    if (import.meta.env.DEV) window.__drift = world; // para depurar desde la consola
    inputRef.current = createInput(box, { onReset: () => world.resetCar() });

    const fit = () => {
      const { width, height } = box.getBoundingClientRect();
      world.resize(width, height);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);

    let raf;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      world.update(dt, inputRef.current.state);
      world.render();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      inputRef.current.destroy();
      world.dispose();
    };
  }, []);

  const start = (mode = 'free') => {
    audio();
    worldRef.current.startAudio();
    worldRef.current.startRun(mode);
    setResult(null);
    setStarted(true);
    boxRef.current.focus({ preventScroll: true });
  };

  const timeMode = hud.mode === 'time' && hud.timeLeft !== null;

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      role="application"
      aria-label="Juego de derrapes en 3D"
      onKeyDown={() => !started && start('free')}
      className={`relative w-full overflow-hidden border-2 border-ink shadow-xl select-none outline-none ${
        full ? 'h-dvh border-0' : 'h-[min(76vh,680px)] min-h-[440px]'
      }`}
    >
      {/* HUD */}
      <div className="absolute top-3 inset-x-3 flex justify-between items-start pointer-events-none z-10">
        <div className="photo-print bg-[#f1ebdd]/90 px-4 py-3 flex gap-6">
          <Stat label={timeMode ? 'Puntos' : 'Total'} value={hud.total} />
          <Stat label={timeMode ? 'Récord 60 s' : 'Mejor derrape'} value={timeMode ? timeRecord : hud.best} />
        </div>
        <div className="flex gap-2">
          {timeMode && (
            <div className={`photo-print px-4 py-3 transition-colors ${hud.timeLeft < 10 ? 'bg-accent' : 'bg-[#f1ebdd]/90'}`}>
              <Stat label="Tiempo" value={formatTime(hud.timeLeft)} />
            </div>
          )}
          <div className="photo-print bg-[#f1ebdd]/90 px-4 py-3">
            <Stat label="km/h" value={hud.speed} />
          </div>
        </div>
      </div>

      {/* Derrape en curso */}
      <div className="absolute top-24 inset-x-0 flex flex-col items-center pointer-events-none z-10">
        {hud.current > 0 && (
          <div className="flex items-baseline gap-3">
            <span className="font-serif font-light text-5xl md:text-6xl tabular-nums">{hud.current}</span>
            {hud.mult > 1 && <span className="bg-ink text-accent px-2 py-0.5 text-lg font-medium -rotate-2">×{hud.mult}</span>}
          </div>
        )}
        {hud.message && (
          <p key={hud.messageKey} className="animate-fade-in font-serif italic text-2xl md:text-3xl mt-1">
            <span className="hand-underline">{hud.message}</span>
          </p>
        )}
      </div>

      {/* Ayuda y acciones */}
      {started && (
        <div className="absolute bottom-3 left-3 right-3 hidden md:flex justify-between items-end text-xs text-ink-soft pointer-events-none z-10">
          <span>WASD / flechas · espacio: freno de mano · R: recolocar</span>
          <button
            type="button"
            onClick={() => worldRef.current.clearMarks()}
            className="pointer-events-auto underline underline-offset-4 hover:text-ink"
          >
            Borrar las marcas del papel
          </button>
        </div>
      )}

      {/* Controles táctiles */}
      {started && touch && (
        <div className="absolute inset-x-0 bottom-0 p-4 flex justify-between items-end pointer-events-none z-10">
          <div className="flex gap-3">
            <TouchButton label="Izquierda" action="left" input={inputRef} className="w-16 h-16 text-2xl">←</TouchButton>
            <TouchButton label="Derecha" action="right" input={inputRef} className="w-16 h-16 text-2xl">→</TouchButton>
          </div>
          <div className="flex gap-3 items-end">
            <TouchButton label="Freno" action="brake" input={inputRef} className="w-14 h-14 text-sm">freno</TouchButton>
            <TouchButton label="Derrape" action="handbrake" input={inputRef} className="w-16 h-16 text-sm">drift</TouchButton>
            <TouchButton label="Acelerar" action="throttle" input={inputRef} className="w-20 h-20 text-sm">gas</TouchButton>
          </div>
        </div>
      )}

      {/* Fin del contrarreloj */}
      {result && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-ink/20">
          <div className="photo-print bg-[#f1ebdd] p-8 max-w-sm w-full text-center -rotate-1 animate-fade-in flex flex-col items-center gap-3">
            <h2 className="text-3xl font-serif font-light">¡Tiempo!</h2>
            <p className="text-6xl font-serif font-light leading-none tabular-nums">{result.total}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">puntos en 60 segundos</p>
            {result.isRecord && <p className="font-serif italic text-xl hand-underline">¡Nuevo récord!</p>}
            <div className="mt-2 flex flex-col items-center gap-1">
              <ScribbleButton onClick={() => start('time')}>Otra vez</ScribbleButton>
              <ScribbleButton onClick={() => start('free')} subtle>Modo libre</ScribbleButton>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla de inicio (también desbloquea el audio del navegador) */}
      {!started && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-ink/15">
          <div className="photo-print bg-[#f1ebdd] p-8 max-w-sm w-full text-center -rotate-1 animate-fade-in flex flex-col items-center gap-3">
            <h2 className="text-3xl font-serif font-light">Derrapes sobre papel</h2>
            <p className="text-ink-soft">
              Acelera, gira y tira del freno de mano para derrapar. Encadena derrapes para subir el multiplicador; chocar te
              lo quita.
            </p>
            <div className="mt-3 flex flex-col items-center gap-1">
              <ScribbleButton onClick={() => start('free')}>Modo libre</ScribbleButton>
              <ScribbleButton onClick={() => start('time')}>Contrarreloj 60 s</ScribbleButton>
            </div>
            {timeRecord > 0 && <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Récord contrarreloj · {timeRecord}</p>}
            <p className="text-xs text-ink-soft">{touch ? 'Controles táctiles en pantalla' : 'WASD / flechas · espacio: freno de mano'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const DriftGame = () => (
  <GameShell title="Derrapes sobre papel" subtitle="Un coche de juguete, una mesa y mucha tinta. Derrapa, encadena y bate tu mejor marca.">
    {({ full }) => <Stage full={full} />}
  </GameShell>
);

export default DriftGame;
