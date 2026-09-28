// Sonido sintetizado con WebAudio: sin archivos, todo se genera al vuelo.
// El silencio se recuerda entre visitas y se comparte entre juegos.

const MUTE_KEY = 'games-muted';
let ctx = null;
let master = null;
let muted = readMuted();
const listeners = new Set();

// Con la pestaña oculta los bucles se paran, pero el audio seguiría sonando (p. ej. el motor):
// se suspende todo el contexto y se reanuda al volver.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });
}

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.6;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return { ctx, master };
}

export const isMuted = () => muted;

export function setMuted(value) {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    /* sin almacenamiento */
  }
  if (master) master.gain.setTargetAtTime(value ? 0 : 0.6, ctx.currentTime, 0.02);
  listeners.forEach((fn) => fn(value));
}

export function onMuteChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Nota corta con envolvente; `slide` desplaza la frecuencia al final
export function tone({ freq = 440, dur = 0.12, type = 'sine', vol = 0.3, slide = 0, delay = 0 } = {}) {
  const a = audio();
  if (!a || muted) return;
  const t = a.ctx.currentTime + delay;
  const osc = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

let noiseBuffer = null;
function getNoise(a) {
  if (!noiseBuffer) {
    noiseBuffer = a.ctx.createBuffer(1, a.ctx.sampleRate * 1, a.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

// Golpe de ruido filtrado (choques, derrapes cortos)
export function noise({ dur = 0.3, vol = 0.4, freq = 800, q = 0.8 } = {}) {
  const a = audio();
  if (!a || muted) return;
  const t = a.ctx.currentTime;
  const src = a.ctx.createBufferSource();
  src.buffer = getNoise(a);
  const filter = a.ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(a.master);
  src.start(t);
  src.stop(t + dur);
}

// Sonido continuo controlable (motor + chirrido de neumáticos)
export function createEngine() {
  const a = audio();
  if (!a) return { update() {}, stop() {} };
  const { ctx: c, master: m } = a;

  const osc = c.createOscillator();
  osc.type = 'sawtooth';
  const osc2 = c.createOscillator();
  osc2.type = 'square';
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 600;
  const engineGain = c.createGain();
  engineGain.gain.value = 0;
  osc.connect(lp);
  osc2.connect(lp);
  lp.connect(engineGain).connect(m);

  const screech = c.createBufferSource();
  screech.buffer = getNoise(a);
  screech.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2200;
  bp.Q.value = 3;
  const screechGain = c.createGain();
  screechGain.gain.value = 0;
  screech.connect(bp).connect(screechGain).connect(m);

  osc.start();
  osc2.start();
  screech.start();

  return {
    // rpm 0..1, drift 0..1
    update(rpm, drift) {
      const t = c.currentTime;
      const f = 45 + rpm * 120;
      osc.frequency.setTargetAtTime(f, t, 0.05);
      osc2.frequency.setTargetAtTime(f * 0.5, t, 0.05);
      lp.frequency.setTargetAtTime(400 + rpm * 1400, t, 0.05);
      engineGain.gain.setTargetAtTime(muted ? 0 : 0.05 + rpm * 0.07, t, 0.05);
      screechGain.gain.setTargetAtTime(muted ? 0 : drift * 0.12, t, 0.04);
      bp.frequency.setTargetAtTime(1800 + drift * 900, t, 0.05);
    },
    stop() {
      try {
        osc.stop();
        osc2.stop();
        screech.stop();
      } catch {
        /* ya parado */
      }
      engineGain.disconnect();
      screechGain.disconnect();
    },
  };
}
