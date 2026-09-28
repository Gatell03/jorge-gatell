import * as THREE from 'three';
import { Car } from './car';
import { SkidMarks, Smoke } from './effects';
import { createEngine, tone, noise } from '../shared/sound';

const PAPER = 0xefe9dc;
const INK = 0x1f1b16;
const YELLOW = 0xf5ce0a;
const CREAM = 0xf3eee2;
const CARDBOARD = 0xb99a6b;
const ARENA = 60; // media anchura de la arena

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...extra });

// ---------------------------------------------------------------------------
// Coche de juguete: primitivas en tinta y amarillo, ruedas que giran y viran
// ---------------------------------------------------------------------------
function buildCar() {
  const root = new THREE.Group();
  const chassis = new THREE.Group();
  root.add(chassis);
  const ink = mat(INK, { roughness: 0.45 });
  const yellow = mat(YELLOW, { roughness: 0.5 });
  const cream = mat(CREAM, { roughness: 0.3 });

  const add = (geo, material, x, y, z, parent = chassis) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  add(new THREE.BoxGeometry(1.8, 0.45, 3.8), ink, 0, 0.6, 0);
  add(new THREE.BoxGeometry(1.52, 0.5, 1.75), ink, 0, 1.05, -0.25);
  add(new THREE.BoxGeometry(1.54, 0.34, 1.5), cream, 0, 1.08, -0.25); // ventanas
  add(new THREE.BoxGeometry(0.34, 0.02, 1.2), yellow, 0, 0.835, 1.25); // franja capó
  add(new THREE.BoxGeometry(0.34, 0.02, 0.9), yellow, 0, 1.31, -0.25); // franja techo
  add(new THREE.BoxGeometry(1.8, 0.08, 0.38), yellow, 0, 1.12, -1.75); // alerón
  add(new THREE.BoxGeometry(0.08, 0.3, 0.12), ink, -0.6, 0.95, -1.75);
  add(new THREE.BoxGeometry(0.08, 0.3, 0.12), ink, 0.6, 0.95, -1.75);
  add(new THREE.BoxGeometry(0.4, 0.14, 0.05), cream, -0.6, 0.65, 1.91); // faros
  add(new THREE.BoxGeometry(0.4, 0.14, 0.05), cream, 0.6, 0.65, 1.91);
  add(new THREE.BoxGeometry(0.4, 0.12, 0.05), yellow, -0.6, 0.66, -1.91);
  add(new THREE.BoxGeometry(0.4, 0.12, 0.05), yellow, 0.6, 0.66, -1.91);

  const tire = mat(0x2a2622, { roughness: 0.9 });
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.34, 18);
  wheelGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.36, 10);
  hubGeo.rotateZ(Math.PI / 2);
  const wheels = [];
  for (const [x, z, front] of [[-0.95, 1.25, true], [0.95, 1.25, true], [-0.95, -1.25, false], [0.95, -1.25, false]]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.4, z);
    root.add(pivot);
    const spin = new THREE.Group();
    pivot.add(spin);
    add(wheelGeo, tire, 0, 0, 0, spin);
    add(hubGeo, yellow, 0, 0, 0, spin);
    wheels.push({ pivot, spin, front });
  }
  return { root, chassis, wheels };
}

// Cono de tráfico de juguete
function buildCone() {
  const g = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.85, 18), mat(YELLOW, { roughness: 0.5 }));
  cone.position.y = 0.48;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.14, 18), mat(CREAM));
  band.position.y = 0.52;
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.07, 0.66), mat(INK));
  base.position.y = 0.035;
  for (const m of [cone, band, base]) {
    m.castShadow = true;
    g.add(m);
  }
  return g;
}

// Lápiz y taza gigantes como decorado fuera de la arena (juguetes sobre la mesa)
function buildProps(scene) {
  const pencil = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 38, 6), mat(YELLOW));
  body.rotation.z = Math.PI / 2;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4, 6), mat(0xe8d3a8));
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = 21;
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.3, 6), mat(INK));
  lead.rotation.z = -Math.PI / 2;
  lead.position.x = 23.4;
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 3, 12), mat(INK));
  eraser.rotation.z = Math.PI / 2;
  eraser.position.x = -20.5;
  pencil.add(body, tip, lead, eraser);
  pencil.position.set(-10, 1.2, ARENA + 9);
  pencil.rotation.y = 0.15;
  pencil.traverse((m) => m.isMesh && (m.castShadow = true));
  scene.add(pencil);

  const mug = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(6, 5.4, 11, 32, 1, true), mat(CREAM, { side: THREE.DoubleSide }));
  cup.position.y = 5.5;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(6, 0.25, 8, 40), mat(INK));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 11;
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(5.8, 32), mat(0x6b4a2b, { roughness: 0.2 }));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 9.5;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.7, 10, 24, Math.PI * 1.2), mat(CREAM));
  handle.position.set(6.6, 6, 0);
  handle.rotation.z = -Math.PI * 0.6;
  mug.add(cup, rim, coffee, handle);
  mug.position.set(ARENA + 14, 0, -18);
  mug.traverse((m) => m.isMesh && (m.castShadow = true));
  scene.add(mug);
}

export class DriftWorld {
  constructor(container, { onHud } = {}) {
    this.onHud = onHud;
    // En pantallas táctiles (móvil/tablet) se aligera el render para que vaya fluido
    const light = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    this.light = light;
    this.renderer = new THREE.WebGLRenderer({ antialias: !light });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, light ? 1.5 : 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'absolute inset-0 w-full h-full';
    container.appendChild(this.renderer.domElement);

    const scene = (this.scene = new THREE.Scene());
    scene.background = new THREE.Color(PAPER);
    scene.fog = new THREE.Fog(PAPER, 55, 150);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
    this.camera.position.set(0, 8, -32);

    scene.add(new THREE.HemisphereLight(0xfffaf0, 0xcfc4ac, 1.25));
    const sun = (this.sun = new THREE.DirectionalLight(0xfff1d6, 1.9));
    sun.castShadow = true;
    sun.shadow.mapSize.set(light ? 1024 : 2048, light ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    scene.add(sun, sun.target);

    // Suelo de papel
    const tex = new THREE.TextureLoader().load('/paper-tile.webp');
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(40, 40);
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat(0xffffff, { map: tex, roughness: 0.95 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Marcas a lápiz de las zonas (círculo de donuts, ocho y salida)
    const pencil = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.18, depthWrite: false });
    const ring = (r, x, z) => {
      const m = new THREE.Mesh(new THREE.RingGeometry(r - 0.08, r + 0.08, 96), pencil);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.008, z);
      scene.add(m);
    };
    ring(9, 0, 22);
    ring(6.5, 28, -6);
    ring(6.5, 28, 7);
    const start = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.25), pencil);
    start.rotation.x = -Math.PI / 2;
    start.position.set(0, 0.008, -17);
    scene.add(start);

    // Paredes de cartón
    const wallMat = mat(CARDBOARD, { roughness: 0.9 });
    const edgeMat = mat(0x8f7248, { roughness: 0.9 });
    for (const [x, z, w, d] of [[0, ARENA, ARENA * 2 + 2, 1], [0, -ARENA, ARENA * 2 + 2, 1], [ARENA, 0, 1, ARENA * 2], [-ARENA, 0, 1, ARENA * 2]]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 1.4, d), wallMat);
      wall.position.set(x, 0.7, z);
      wall.castShadow = wall.receiveShadow = true;
      const edge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.08, d + 0.02), edgeMat);
      edge.position.set(x, 1.42, z);
      scene.add(wall, edge);
    }
    buildProps(scene);

    // Conos: círculo de donuts, slalom y ocho
    this.cones = [];
    const addCone = (x, z) => {
      const mesh = buildCone();
      mesh.position.set(x, 0, z);
      scene.add(mesh);
      this.cones.push({ mesh, home: [x, z], x, z, y: 0, vx: 0, vy: 0, vz: 0, spin: new THREE.Vector3(), knocked: false, timer: 0 });
    };
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      addCone(Math.cos(a) * 3, 22 + Math.sin(a) * 3);
    }
    for (let i = 0; i < 8; i++) addCone(-26 + (i % 2 ? 1.4 : -1.4), -32 + i * 9);
    addCone(28, -6);
    addCone(28, 7);

    const car = buildCar();
    this.carMesh = car;
    scene.add(car.root);
    this.car = new Car();

    this.skids = new SkidMarks(scene);
    this.smoke = new Smoke(scene, light ? 80 : 140);
    this.smokeAcc = 0;

    this.score = { current: 0, combo: 0, total: 0, best: 0, chain: 0, idle: 0, message: '', messageAt: 0 };
    this.hudTimer = 0;
    this.engine = null;
    this.time = 0;
    this.mode = 'free'; // 'free' | 'time'
    this.timeLeft = Infinity;
    this.finished = false;
  }

  // Nueva partida: modo libre o contrarreloj de 60 s (reinicia coche, marcas y puntuación)
  startRun(mode = 'free') {
    this.mode = mode;
    this.timeLeft = mode === 'time' ? 60 : Infinity;
    this.finished = false;
    this.resetCar();
    this.clearMarks();
    Object.assign(this.score, { current: 0, combo: 0, total: 0, chain: 0, idle: 0, message: '', messageAt: 0 });
    for (const c of this.cones) c.timer = Math.min(c.timer, 0.01);
    this.hudTimer = 0;
  }

  startAudio() {
    if (!this.engine) this.engine = createEngine();
  }

  setBest(best) {
    this.score.best = best;
  }

  resize(w, h) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w < 600 ? 68 : 55;
    this.camera.updateProjectionMatrix();
  }

  resetCar() {
    this.car.reset(0, -20, 0);
    this.skids.lift('l');
    this.skids.lift('r');
    this.loseDrift();
  }

  clearMarks() {
    this.skids.clear();
  }

  message(text) {
    this.score.message = text;
    this.score.messageAt = this.time;
  }

  loseDrift(text) {
    const s = this.score;
    if (s.current > 20 && text) this.message(text);
    s.current = 0;
    s.combo = 0;
    s.chain = 0;
  }

  bankDrift() {
    const s = this.score;
    const mult = 1 + s.combo * 0.5;
    const pts = Math.round(s.current * mult);
    if (pts > 0) {
      s.total += pts;
      const best = pts > s.best;
      if (best) s.best = pts;
      this.message(best ? `¡Récord! +${pts}` : `+${pts}`);
      tone({ freq: best ? 990 : 780, dur: 0.14, vol: 0.12 });
      if (best) tone({ freq: 1320, dur: 0.18, vol: 0.12, delay: 0.1 });
      this.onBest?.(s.best);
    }
    s.current = 0;
    s.combo = Math.min(s.combo + 1, 8);
    s.chain = 2.2; // tiempo para encadenar el siguiente derrape
  }

  update(dt, rawInput) {
    this.time += dt;
    const car = this.car;

    // Contrarreloj: al llegar a 0 se guarda el derrape en curso y el coche se detiene
    if (this.mode === 'time' && !this.finished) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.finished = true;
        if (this.score.current > 0) this.bankDrift();
        tone({ freq: 660, dur: 0.15, vol: 0.15 });
        tone({ freq: 440, dur: 0.3, vol: 0.15, delay: 0.15 });
        this.onFinish?.(this.score.total);
      } else if (Math.ceil(this.timeLeft) !== Math.ceil(this.timeLeft + dt) && this.timeLeft < 10) {
        tone({ freq: 880, dur: 0.06, type: 'square', vol: 0.05 }); // tic de los últimos 10 s
      }
    }
    const input = this.finished ? { throttle: false, brake: false, left: false, right: false, handbrake: false } : rawInput;
    car.update(dt, input);
    if (this.finished) {
      const k = Math.exp(-2.5 * dt);
      car.vx *= k;
      car.vz *= k;
    }

    // Límites de la arena (paredes de cartón)
    const lim = ARENA - 1.8;
    const hitWall = (nx, nz) => {
      const impact = car.bounce(nx, nz);
      if (impact > 4) {
        noise({ dur: 0.25, vol: Math.min(0.5, impact * 0.04), freq: 300 });
        this.shake = Math.min(1, impact * 0.06);
        this.loseDrift('¡Contra el cartón!');
      }
    };
    if (car.x > lim) { car.x = lim; hitWall(-1, 0); }
    if (car.x < -lim) { car.x = -lim; hitWall(1, 0); }
    if (car.z > lim) { car.z = lim; hitWall(0, -1); }
    if (car.z < -lim) { car.z = -lim; hitWall(0, 1); }

    const [fx, fz] = car.fwd;
    const [rx, rz] = car.right;

    // Conos
    for (const c of this.cones) {
      if (!c.knocked) {
        for (const off of [1.1, -1.1]) {
          const cx = car.x + fx * off;
          const cz = car.z + fz * off;
          const dx = c.x - cx;
          const dz = c.z - cz;
          const d = Math.hypot(dx, dz);
          if (d < 1.35 && car.speed > 1.5) {
            c.knocked = true;
            c.timer = 7;
            const n = [dx / (d || 1), dz / (d || 1)];
            c.vx = car.vx * 0.9 + n[0] * 3;
            c.vz = car.vz * 0.9 + n[1] * 3;
            c.vy = 3 + car.speed * 0.25;
            c.spin.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(14);
            tone({ freq: 220, dur: 0.1, type: 'triangle', vol: 0.16, slide: -60 });
            if (this.score.current > 0) {
              this.score.current *= 0.5;
              this.message('¡Cono! −50 %');
            }
            break;
          }
        }
      } else {
        c.timer -= dt;
        c.vy -= 22 * dt;
        c.x += c.vx * dt;
        c.z += c.vz * dt;
        c.y += c.vy * dt;
        if (c.y < 0) {
          c.y = 0;
          c.vy *= -0.3;
          c.vx *= 0.7;
          c.vz *= 0.7;
          c.spin.multiplyScalar(0.6);
        }
        c.mesh.rotation.x += c.spin.x * dt;
        c.mesh.rotation.y += c.spin.y * dt;
        c.mesh.rotation.z += c.spin.z * dt;
        if (c.timer <= 0) {
          // Vuelve a su sitio con un pequeño "pop"
          c.knocked = false;
          [c.x, c.z] = c.home;
          c.y = 0;
          c.mesh.rotation.set(0, 0, 0);
          c.mesh.scale.setScalar(0.01);
        }
      }
      c.mesh.position.set(c.x, c.y, c.z);
      if (!c.knocked && c.mesh.scale.x < 1) c.mesh.scale.setScalar(Math.min(1, c.mesh.scale.x + dt * 4));
    }

    // Puntuación de derrape
    const drift = car.driftAmount;
    const s = this.score;
    if (drift > 0.12 && car.speed > 7) {
      s.current += dt * (car.slip * 57.3) * (car.speed / 10) * 1.3;
      s.idle = 0;
    } else if (s.current > 0) {
      s.idle += dt;
      if (s.idle > 0.6) this.bankDrift();
    } else if (s.chain > 0) {
      s.chain -= dt;
      if (s.chain <= 0) s.combo = 0;
    }

    // Marcas y humo en las ruedas traseras
    const wheels = [
      ['l', car.x - rx * 0.95 - fx * 1.25, car.z - rz * 0.95 - fz * 1.25],
      ['r', car.x + rx * 0.95 - fx * 1.25, car.z + rz * 0.95 - fz * 1.25],
    ];
    const braking = input.brake && car.forwardSpeed > 10;
    for (const [id, wx, wz] of wheels) {
      if (drift > 0.08 || braking || (input.handbrake && car.speed > 4)) this.skids.add(id, wx, wz, rx, rz, Math.max(drift, 0.4));
      else this.skids.lift(id);
    }
    this.smokeAcc += dt * (this.light ? 26 : 38) * drift;
    while (this.smokeAcc > 1) {
      this.smokeAcc -= 1;
      const [, wx, wz] = wheels[Math.random() < 0.5 ? 0 : 1];
      this.smoke.emit(wx, wz, car.vx, car.vz, drift);
    }
    this.smoke.update(dt);

    this.engine?.update(Math.min(1, Math.abs(car.forwardSpeed) / 31 + (input.throttle ? 0.15 : 0)), drift);
    this.syncMeshes(dt, input);
    this.updateCamera(dt, drift);

    this.hudTimer -= dt;
    if (this.hudTimer <= 0) {
      this.hudTimer = 0.08;
      this.onHud?.({
        current: Math.round(s.current),
        mult: 1 + s.combo * 0.5,
        total: s.total,
        best: s.best,
        speed: Math.round(car.speed * 3.6),
        drifting: drift > 0.12,
        message: this.time - s.messageAt < 1.6 ? s.message : '',
        messageKey: s.messageAt,
        mode: this.mode,
        timeLeft: Number.isFinite(this.timeLeft) ? this.timeLeft : null,
      });
    }
  }

  syncMeshes(dt) {
    const car = this.car;
    const { root, chassis, wheels } = this.carMesh;
    root.position.set(car.x, 0, car.z);
    root.rotation.y = car.heading;
    const roll = THREE.MathUtils.clamp(-car.lateral * 0.012, -0.09, 0.09);
    const pitch = THREE.MathUtils.clamp(-car.accel * 0.0025, -0.05, 0.05);
    chassis.rotation.z += (roll - chassis.rotation.z) * Math.min(1, dt * 8);
    chassis.rotation.x += (pitch - chassis.rotation.x) * Math.min(1, dt * 6);
    for (const w of wheels) {
      w.spin.rotation.x += (car.forwardSpeed * dt) / 0.4;
      if (w.front) w.pivot.rotation.y = car.steer * 0.5;
    }
  }

  updateCamera(dt, drift) {
    const car = this.car;
    const [fx, fz] = car.fwd;
    // Mirar en la dirección del movimiento (no del morro) hace que el derrape se vea de lado
    const vlen = Math.hypot(car.vx, car.vz);
    const followVel = vlen > 3 && car.forwardSpeed > 0; // en marcha atrás, la cámara sigue al morro
    const mx = followVel ? car.vx / vlen : fx;
    const mz = followVel ? car.vz / vlen : fz;
    const dx = fx * 0.4 + mx * 0.6;
    const dz = fz * 0.4 + mz * 0.6;
    const back = 8.5 + car.speed * 0.12;
    const target = new THREE.Vector3(car.x - dx * back, 4.2 + car.speed * 0.06, car.z - dz * back);
    this.camera.position.lerp(target, Math.min(1, dt * 3.5));
    this.shake = Math.max(0, (this.shake || 0) - dt * 2);
    const k = drift * 0.05 + this.shake * 0.25;
    this.camera.position.x += (Math.random() - 0.5) * k;
    this.camera.position.y += (Math.random() - 0.5) * k;
    this.camera.lookAt(car.x + fx * 2.5, 0.8, car.z + fz * 2.5);

    this.sun.position.set(car.x + 18, 34, car.z + 12);
    this.sun.target.position.set(car.x, 0, car.z);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.engine?.stop();
    this.skids.dispose();
    this.smoke.dispose();
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          m.map?.dispose();
          m.dispose();
        });
      }
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
