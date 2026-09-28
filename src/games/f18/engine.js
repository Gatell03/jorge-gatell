// Motor del F-18: física con delta time, dificultad progresiva y dibujo a tinta en <canvas>.
// Las unidades se escalan con la altura del tablero (S = alto / 500) para que juegue igual en móvil.
import { noise, tone } from '../shared/sound';

const LABELS = ['bug', 'deadline', 'merge', '404', 'NaN', 'segfault', 'undefined'];
const INK = '#1f1b16';
const INK_SOFT = '#4a4238';
const CARD = '#fffdf8';
const YELLOW = '#f5ce0a';
const SERIF = "'Fraunces', Georgia, serif";
const SANS = "'Instrument Sans', system-ui, sans-serif";
const TIP = 52; // largo de la punta del lápiz (en unidades de 500 px de alto)
const FERRULE = 18;
const ERASER = 16;
const MIN_PENCIL = TIP + FERRULE + ERASER + 40; // longitud mínima visible de cada lápiz

const rand = (a, b) => a + Math.random() * (b - a);

// Generador pseudoaleatorio con semilla: cada muro tiembla siempre igual (sin parpadeo)
const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

export const MEDALS = [
  { min: 50, name: 'Oro', color: '#d9a70a' },
  { min: 25, name: 'Plata', color: '#9a9a9a' },
  { min: 10, name: 'Bronce', color: '#b0703a' },
];

export class F18Engine {
  constructor({ onScore, onDeath, onLevel } = {}) {
    this.cb = { onScore, onDeath, onLevel };
    this.plane = new Image();
    this.plane.src = '/f18.webp';
    this.W = 800;
    this.H = 500;
    this.S = 1;
    this.mode = 'menu';
    this.time = 0;
    this.grain = null;
    this.clouds = [];
    this.reset();
  }

  resize(W, H) {
    this.W = W;
    this.H = H;
    this.S = H / 500;
    this.planeX = Math.max(50, W * 0.18);
    if (!this.clouds.length) this.makeClouds();
    this.makeGrain();
  }

  makeGrain() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#f3eee2';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = `rgba(31,27,22,${rand(0.02, 0.07)})`;
      g.fillRect(rand(0, 256), rand(0, 256), 1, 1);
    }
    this.grain = c;
    this.pattern = null;
  }

  makeClouds() {
    this.clouds = [];
    [0.15, 0.35, 0.6].forEach((speed, layer) => {
      for (let i = 0; i < 4; i++) {
        this.clouds.push({ layer, speed, x: rand(0, this.W * 1.3), y: rand(0.05, 0.75), size: 0.6 + layer * 0.35 + rand(0, 0.3), seed: Math.floor(rand(1, 1e6)) });
      }
    });
  }

  reset() {
    this.y = this.H / 2;
    this.vy = 0;
    this.walls = [];
    this.items = [];
    this.particles = [];
    this.floaters = [];
    this.trail = [];
    this.score = 0;
    this.level = 1;
    this.shield = false;
    this.shake = 0;
    this.flash = 0;
    this.countdown = 0;
    this.distance = 0;
  }

  // --- Control -------------------------------------------------------------
  start() {
    this.reset();
    this.mode = 'countdown';
    this.countdown = 3;
    tone({ freq: 440, dur: 0.12, type: 'triangle', vol: 0.18 });
  }

  flap() {
    if (this.mode !== 'playing') return;
    this.vy = -470 * this.S;
    tone({ freq: 520, dur: 0.08, type: 'triangle', vol: 0.12, slide: 180 });
  }

  pause(p = true) {
    if (p && this.mode === 'playing') this.mode = 'paused';
    else if (!p && this.mode === 'paused') this.mode = 'playing';
  }

  get speed() {
    return (215 + Math.min(this.score, 60) * 4) * this.S;
  }

  get gap() {
    return Math.max(128, 182 - this.score * 1.3) * this.S;
  }

  // --- Simulación ----------------------------------------------------------
  update(dt) {
    this.time += dt;
    const S = this.S;
    const moving = this.mode === 'playing' || this.mode === 'menu' || this.mode === 'countdown';
    const scroll = (this.mode === 'playing' ? this.speed : 90 * S) * dt;

    if (moving) {
      for (const c of this.clouds) {
        c.x -= scroll * c.speed;
        if (c.x < -200 * S) {
          c.x = this.W + rand(40, 300) * S;
          c.y = rand(0.05, 0.75);
        }
      }
    }

    if (this.mode === 'countdown') {
      const before = Math.ceil(this.countdown);
      this.countdown -= dt;
      this.y = this.H / 2 + Math.sin(this.time * 4) * 8 * S;
      const after = Math.ceil(this.countdown);
      if (after !== before && after > 0) tone({ freq: 440, dur: 0.12, type: 'triangle', vol: 0.18 });
      if (this.countdown <= 0) {
        this.mode = 'playing';
        this.vy = -380 * S;
        tone({ freq: 880, dur: 0.2, type: 'triangle', vol: 0.2 });
      }
    }

    if (this.mode === 'menu') this.y = this.H / 2 + Math.sin(this.time * 2) * 14 * S;

    if (this.mode === 'playing') this.step(dt, scroll);

    // Partículas y textos flotantes siguen vivos incluso tras el choque
    if (this.mode !== 'paused') {
      for (const p of this.particles) {
        p.vy += 900 * S * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.life -= dt;
      }
      this.particles = this.particles.filter((p) => p.life > 0);
      for (const f of this.floaters) {
        f.y -= 40 * S * dt;
        f.life -= dt;
      }
      this.floaters = this.floaters.filter((f) => f.life > 0);
      this.shake = Math.max(0, this.shake - dt * 2.5);
      this.flash = Math.max(0, this.flash - dt * 3);
    }
  }

  step(dt, scroll) {
    const S = this.S;
    this.vy += 1500 * S * dt;
    this.y += this.vy * dt;
    this.distance += scroll;

    this.trail.push({ x: this.planeX, y: this.y + 18 * S });
    for (const t of this.trail) t.x -= scroll;
    this.trail = this.trail.filter((t) => t.x > -20).slice(-40);

    for (const w of this.walls) w.x -= scroll;
    for (const it of this.items) it.x -= scroll;
    this.walls = this.walls.filter((w) => w.x + 70 * S > 0);
    this.items = this.items.filter((it) => it.x > -40 && !it.taken);

    const last = this.walls[this.walls.length - 1];
    if (!last || last.x < this.W - 300 * S) this.spawnWall();

    // Hitbox algo menor que el avión, para que sea justo
    const top = this.y + 7 * S;
    const bottom = this.y + 31 * S;
    const left = this.planeX + 10 * S;
    const right = this.planeX + 66 * S;
    const WALL = 64 * S;

    let hit = top < -30 * S || bottom > this.H;
    for (const w of this.walls) {
      const overlapX = right > w.x && left < w.x + WALL;
      if (overlapX && this.hitsPencils(w, top, bottom, left, right)) {
        if (this.shield && !w.shieldUsed) {
          w.shieldUsed = true;
          this.shield = false;
          this.shake = 0.6;
          this.burst(this.planeX + 30 * S, this.y + 18 * S, 16, ['#7a5230', CARD, YELLOW]);
          this.float('¡Escudo!', this.planeX + 30 * S, this.y - 10 * S);
          noise({ dur: 0.25, vol: 0.35, freq: 1200 });
        } else if (!w.shieldUsed) {
          hit = true;
        }
      }
      if (overlapX) w.minClear = Math.min(w.minClear, top - w.gapTop, w.gapTop + w.gap - bottom);
      if (!w.passed && left > w.x + WALL) {
        w.passed = true;
        this.addScore(1, w.x + WALL, w.gapTop + w.gap / 2);
        if (w.minClear < 14 * S && w.minClear > 0) {
          this.addScore(1, this.planeX + 40 * S, this.y - 20 * S, '¡Al límite! +1');
          this.flash = 1;
          tone({ freq: 1250, dur: 0.07, type: 'square', vol: 0.06 });
        }
      }
    }

    for (const it of this.items) {
      const dx = it.x - (this.planeX + 38 * S);
      const dy = it.y - (this.y + 18 * S);
      if (!it.taken && dx * dx + dy * dy < (34 * S) ** 2) {
        it.taken = true;
        if (it.type === 'star') {
          this.addScore(2, it.x, it.y, '+2 ★');
          this.burst(it.x, it.y, 10, [YELLOW, INK]);
          tone({ freq: 1320, dur: 0.09, vol: 0.14 });
          tone({ freq: 1760, dur: 0.12, vol: 0.12, delay: 0.06 });
        } else {
          this.shield = true;
          this.float('Café: escudo', it.x, it.y);
          tone({ freq: 520, dur: 0.18, type: 'triangle', vol: 0.15, slide: 400 });
        }
      }
    }

    if (hit) this.die();
  }

  // Colisión con la forma real: cuerpo rectangular + punta triangular que apunta al hueco
  hitsPencils(w, top, bottom, left, right) {
    const WALL = 64 * this.S;
    const tip = TIP * this.S;
    const cx = w.x + WALL / 2;
    const overlapsTip = (y, tipEnd, dir) => {
      const t = (tipEnd - y) * dir; // distancia desde la punta hacia el cuerpo
      if (t <= 0) return false;
      if (t >= tip) return true;
      const hw = (WALL / 2) * (t / tip);
      return right > cx - hw && left < cx + hw;
    };
    const upper = w.gapTop;
    const lower = w.gapTop + w.gap;
    return overlapsTip(top, upper, 1) || overlapsTip(bottom, lower, -1);
  }

  spawnWall() {
    const S = this.S;
    const gap = this.gap;
    // Cada lápiz necesita sitio para punta + cuerpo + virola + goma
    const margin = Math.min(MIN_PENCIL * S, (this.H - gap) / 2);
    const gapTop = margin + Math.random() * (this.H - gap - margin * 2);
    const x = this.W + 10 * S;
    this.walls.push({
      x,
      gap,
      gapTop,
      label: LABELS[Math.floor(Math.random() * LABELS.length)],
      passed: false,
      minClear: Infinity,
      seed: Math.floor(rand(1, 1e6)),
    });
    const r = Math.random();
    const itemX = x + 64 * S + 150 * S;
    if (r < 0.35) this.items.push({ type: 'star', x: itemX, y: rand(0.2, 0.8) * this.H, phase: rand(0, 6) });
    else if (r < 0.43 && !this.shield) this.items.push({ type: 'coffee', x: itemX, y: rand(0.25, 0.75) * this.H, phase: rand(0, 6) });
  }

  addScore(n, x, y, text) {
    const oldLevel = this.level;
    this.score += n;
    this.float(text ?? `+${n}`, x, y);
    if (!text) tone({ freq: 880, dur: 0.08, vol: 0.1 });
    this.level = 1 + Math.floor(this.score / 10);
    if (this.level > oldLevel) {
      this.float(`Nivel ${this.level}`, this.W / 2, this.H * 0.4, true);
      tone({ freq: 660, dur: 0.1, vol: 0.15 });
      tone({ freq: 990, dur: 0.16, vol: 0.15, delay: 0.1 });
      this.cb.onLevel?.(this.level);
    }
    this.cb.onScore?.(this.score);
  }

  float(text, x, y, big = false) {
    this.floaters.push({ text, x, y, life: big ? 1.4 : 0.9, max: big ? 1.4 : 0.9, big });
  }

  burst(x, y, n, colors) {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x, y,
        vx: rand(-260, 260) * this.S,
        vy: rand(-420, -60) * this.S,
        rot: rand(0, 6), vr: rand(-12, 12),
        size: rand(4, 9) * this.S,
        life: rand(0.6, 1.2),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  die() {
    this.mode = 'over';
    this.shake = 1;
    this.burst(this.planeX + 36 * this.S, this.y + 18 * this.S, 34, [CARD, INK, YELLOW, '#d8d0bd']);
    noise({ dur: 0.5, vol: 0.5, freq: 380 });
    tone({ freq: 140, dur: 0.45, type: 'sawtooth', vol: 0.15, slide: -90 });
    this.cb.onDeath?.(this.score);
  }

  // --- Dibujo --------------------------------------------------------------
  draw(ctx) {
    const { W, H, S } = this;
    ctx.save();
    if (this.shake > 0) {
      const k = this.shake * this.shake * 10 * S;
      ctx.translate(rand(-k, k), rand(-k, k));
    }

    this.pattern ??= ctx.createPattern(this.grain, 'repeat');
    ctx.fillStyle = this.pattern;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    for (const c of this.clouds) this.drawCloud(ctx, c);
    this.drawTrail(ctx);
    for (const w of this.walls) this.drawWall(ctx, w);
    for (const it of this.items) this.drawItem(ctx, it);
    if (this.mode !== 'over') this.drawPlane(ctx);
    this.drawParticles(ctx);
    this.drawFloaters(ctx);

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(245,206,10,${this.flash * 0.18})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    this.drawHud(ctx);
  }

  drawCloud(ctx, c) {
    const S = this.S;
    const x = c.x;
    const y = c.y * this.H;
    const s = c.size * 30 * S;
    const blobs = [[-0.9, 0.15, 0.6], [0, -0.15, 0.8], [0.95, 0.2, 0.55], [0.2, 0.35, 0.55]];
    const shape = (grow) => {
      ctx.beginPath();
      for (const [bx, by, r] of blobs) {
        ctx.moveTo(x + bx * s + r * s + grow, y + by * s);
        ctx.arc(x + bx * s, y + by * s, r * s + grow, 0, Math.PI * 2);
      }
      ctx.rect(x - 1.5 * s - grow, y + 0.2 * s, 3 * s + grow * 2, 0.55 * s + grow);
    };
    // Contorno exterior: tinta un poco más grande y relleno opaco encima (tapa las líneas interiores).
    // Las capas lejanas llevan el trazo más claro.
    shape(1.5 * S);
    ctx.fillStyle = `rgba(74,66,56,${0.22 + c.layer * 0.18})`;
    ctx.fill();
    shape(0);
    ctx.fillStyle = '#f9f6ee';
    ctx.fill();
  }

  drawTrail(ctx) {
    if (this.trail.length < 2) return;
    const S = this.S;
    for (let i = 1; i < this.trail.length; i++) {
      const a = this.trail[i - 1];
      const b = this.trail[i];
      ctx.strokeStyle = `rgba(74,66,56,${(i / this.trail.length) * 0.35})`;
      ctx.lineWidth = (i / this.trail.length) * 4 * S;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  // Lápiz gigante: cuerpo hexagonal amarillo, punta de madera con grafito hacia el hueco
  // y virola + goma en el extremo que toca el borde del tablero.
  drawWall(ctx, w) {
    const S = this.S;
    const WALL = 64 * S;
    const tip = TIP * S;
    const x = w.x;
    const cx = x + WALL / 2;
    this.drawPencil(ctx, w, x, cx, WALL, tip, -2 * S, w.gapTop, true);
    this.drawPencil(ctx, w, x, cx, WALL, tip, this.H + 2 * S, w.gapTop + w.gap, false);
  }

  // `end` = borde del tablero, `point` = punta; `down` = la punta mira hacia abajo
  drawPencil(ctx, w, x, cx, WALL, tip, end, point, down) {
    const S = this.S;
    const dir = down ? 1 : -1;
    const bodyEnd = point - tip * dir; // donde empieza la madera
    const rnd = seeded(w.seed + (down ? 1 : 2));
    const j = () => (rnd() - 0.5) * 2.4 * S;
    const ink = w.shieldUsed ? 'rgba(31,27,22,0.45)' : INK;

    // Sombra suave a la derecha
    ctx.fillStyle = 'rgba(31,27,22,0.08)';
    ctx.beginPath();
    ctx.moveTo(x + 7 * S, end);
    ctx.lineTo(x + WALL + 7 * S, end);
    ctx.lineTo(x + WALL + 7 * S, bodyEnd);
    ctx.lineTo(cx + 7 * S, point + 4 * S * dir);
    ctx.lineTo(x + 7 * S, bodyEnd);
    ctx.fill();

    // Cuerpo: tres caras del hexágono (la central más clara)
    const faces = [['#e2b80a', 0, 0.3], ['#f7d53a', 0.3, 0.7], ['#e8bf0c', 0.7, 1]];
    for (const [color, a, b] of faces) {
      ctx.fillStyle = w.shieldUsed ? '#e9dfb8' : color;
      ctx.fillRect(x + WALL * a, Math.min(end, bodyEnd), WALL * (b - a), Math.abs(bodyEnd - end));
    }
    ctx.strokeStyle = 'rgba(31,27,22,0.35)';
    ctx.lineWidth = 1.2 * S;
    for (const f of [0.3, 0.7]) {
      ctx.beginPath();
      ctx.moveTo(x + WALL * f, end);
      ctx.lineTo(x + WALL * f, bodyEnd);
      ctx.stroke();
    }

    // Madera afilada (con el borde festoneado típico del sacapuntas) y grafito
    ctx.beginPath();
    ctx.moveTo(x, bodyEnd);
    for (let i = 0; i < 3; i++) {
      const x0 = x + (WALL / 3) * i;
      ctx.quadraticCurveTo(x0 + WALL / 6, bodyEnd + 9 * S * dir, x0 + WALL / 3, bodyEnd);
    }
    ctx.lineTo(cx, point);
    ctx.closePath();
    ctx.fillStyle = '#ead6ad';
    ctx.fill();
    const lead = 0.38;
    ctx.beginPath();
    ctx.moveTo(cx - (WALL / 2) * lead, point - tip * lead * dir);
    ctx.lineTo(cx + (WALL / 2) * lead, point - tip * lead * dir);
    ctx.lineTo(cx, point);
    ctx.closePath();
    ctx.fillStyle = '#2e2a26';
    ctx.fill();

    // Virola metálica y goma en el extremo del borde
    // Si el lápiz es corto (hueco pegado al borde), sin virola ni goma para que no se amontonen
    const room = Math.abs(bodyEnd - end);
    const hasEnd = room > (FERRULE + ERASER + 16) * S;
    const ferrule = hasEnd ? FERRULE * S : 0;
    const eraser = hasEnd ? ERASER * S : 0;
    const e0 = end;
    const e1 = end + eraser * dir;
    const f1 = e1 + ferrule * dir;
    if (hasEnd) {
      ctx.fillStyle = w.shieldUsed ? '#e6d6d0' : '#e7a79a';
      ctx.fillRect(x + 2 * S, Math.min(e0, e1), WALL - 4 * S, Math.abs(e1 - e0));
      ctx.fillStyle = '#cfc9bd';
      ctx.fillRect(x - 1 * S, Math.min(e1, f1), WALL + 2 * S, Math.abs(f1 - e1));
      ctx.strokeStyle = 'rgba(31,27,22,0.4)';
      ctx.lineWidth = 1 * S;
      for (const k of [0.33, 0.66]) {
        const yy = e1 + ferrule * k * dir;
        ctx.beginPath();
        ctx.moveTo(x - 1 * S, yy);
        ctx.lineTo(x + WALL + 1 * S, yy);
        ctx.stroke();
      }
    }

    // Contorno a tinta tembloroso
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2 * S;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x + j(), end);
    ctx.lineTo(x + j(), bodyEnd + j());
    ctx.lineTo(cx + j(), point);
    ctx.lineTo(x + WALL + j(), bodyEnd + j());
    ctx.lineTo(x + WALL + j(), end);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, bodyEnd);
    for (let i = 0; i < 3; i++) {
      const x0 = x + (WALL / 3) * i;
      ctx.quadraticCurveTo(x0 + WALL / 6, bodyEnd + 9 * S * dir, x0 + WALL / 3, bodyEnd);
    }
    ctx.lineWidth = 1.4 * S;
    ctx.stroke();
    if (hasEnd) {
      ctx.beginPath();
      ctx.moveTo(x, f1);
      ctx.lineTo(x + WALL, f1);
      ctx.stroke();
    }

    // Etiqueta grabada a lo largo del cuerpo (como la marca de un lápiz)
    const len = Math.abs(bodyEnd - f1);
    if (len > 70 * S) {
      const mid = (bodyEnd + f1) / 2;
      ctx.save();
      ctx.translate(cx, mid);
      ctx.rotate(-Math.PI / 2);
      ctx.font = `italic 500 ${15 * S}px ${SERIF}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = w.shieldUsed ? 'rgba(31,27,22,0.35)' : 'rgba(31,27,22,0.78)';
      ctx.fillText(`${w.label} · HB`, 0, 1 * S);
      ctx.restore();
    }
  }

  drawItem(ctx, it) {
    const S = this.S;
    const y = it.y + Math.sin(this.time * 3 + it.phase) * 6 * S;
    ctx.save();
    ctx.translate(it.x, y);
    if (it.type === 'star') {
      ctx.rotate(Math.sin(this.time * 2 + it.phase) * 0.3);
      const r = 16 * S;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 ? r * 0.28 : r;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fillStyle = YELLOW;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5 * S;
      ctx.stroke();
    } else {
      // Taza de café
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2 * S;
      ctx.fillStyle = CARD;
      ctx.beginPath();
      ctx.moveTo(-12 * S, -8 * S);
      ctx.lineTo(10 * S, -8 * S);
      ctx.lineTo(7 * S, 12 * S);
      ctx.lineTo(-9 * S, 12 * S);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(12 * S, 1 * S, 5 * S, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = '#7a5230';
      ctx.fillRect(-10 * S, -6 * S, 19 * S, 4 * S);
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 5 * S, -12 * S);
        ctx.quadraticCurveTo(i * 5 * S + 4 * S, -17 * S, i * 5 * S, -22 * S + Math.sin(this.time * 5 + i) * 2 * S);
        ctx.lineWidth = 1.2 * S;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawPlane(ctx) {
    const S = this.S;
    const w = 76 * S;
    const h = w * (this.plane.naturalHeight / this.plane.naturalWidth || 0.56);
    const angle = this.mode === 'playing' ? Math.min(Math.max(this.vy / (1100 * S), -0.35), 0.8) : Math.sin(this.time * 2) * 0.06;
    ctx.save();
    ctx.translate(this.planeX + w / 2, this.y + h / 2);
    ctx.rotate(angle);
    if (this.plane.complete) ctx.drawImage(this.plane, -w / 2, -h / 2, w, h);
    if (this.shield) {
      ctx.setLineDash([6 * S, 5 * S]);
      ctx.lineDashOffset = -this.time * 30;
      ctx.strokeStyle = '#7a5230';
      ctx.lineWidth = 2 * S;
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.68, h * 0.95, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 1.5);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
      ctx.strokeStyle = 'rgba(31,27,22,0.4)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
      ctx.restore();
    }
  }

  drawFloaters(ctx) {
    const S = this.S;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.min(1, f.life / (f.max * 0.5));
      ctx.font = f.big ? `300 ${54 * S}px ${SERIF}` : `italic 500 ${17 * S}px ${SERIF}`;
      ctx.fillStyle = INK;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  drawHud(ctx) {
    const { W, H, S } = this;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    if (this.mode === 'playing' || this.mode === 'paused' || this.mode === 'over') {
      ctx.font = `300 ${64 * S}px ${SERIF}`;
      ctx.fillStyle = 'rgba(31,27,22,0.35)';
      ctx.fillText(String(this.score), W / 2, 14 * S);
    }
    if (this.mode === 'countdown') {
      const n = Math.ceil(this.countdown);
      const k = this.countdown - Math.floor(this.countdown);
      ctx.save();
      ctx.globalAlpha = k;
      ctx.font = `300 ${(120 + (1 - k) * 60) * S}px ${SERIF}`;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = INK;
      ctx.fillText(String(n), W / 2, H / 2);
      ctx.restore();
    }
    if (this.shield && this.mode === 'playing') {
      ctx.textAlign = 'left';
      ctx.font = `500 ${12 * S}px ${SANS}`;
      ctx.fillStyle = INK_SOFT;
      ctx.fillText('ESCUDO ACTIVO', 16 * S, 16 * S);
    }
  }
}
