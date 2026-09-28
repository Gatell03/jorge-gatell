import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Marcas de neumático: cintas de "tinta" sobre el papel, en un búfer circular
// (nunca crece la memoria: al llenarse, las marcas más antiguas se reutilizan)
// ---------------------------------------------------------------------------
export class SkidMarks {
  constructor(scene, { max = 4000, width = 0.3 } = {}) {
    this.max = max;
    this.width = width;
    this.count = 0;
    this.positions = new Float32Array(max * 4 * 3);
    const index = new Uint32Array(max * 6);
    for (let i = 0; i < max; i++) {
      const v = i * 4;
      index.set([v, v + 1, v + 2, v + 2, v + 1, v + 3], i * 6);
    }
    this.geometry = new THREE.BufferGeometry();
    this.attr = new THREE.BufferAttribute(this.positions, 3);
    this.attr.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('position', this.attr);
    this.geometry.setIndex(new THREE.BufferAttribute(index, 1));
    this.geometry.setDrawRange(0, 0);
    this.material = new THREE.MeshBasicMaterial({
      color: 0x1f1b16,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide, // el sentido del tramo depende de hacia dónde va el coche
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
    scene.add(this.mesh);
    this.last = {}; // última posición por rueda
  }

  // Añade un tramo para la rueda `id` en (x, z); `rx, rz` = eje lateral del coche
  add(id, x, z, rx, rz, strength) {
    const prev = this.last[id];
    const hw = (this.width * (0.6 + strength * 0.4)) / 2;
    const cur = { x, z, lx: x - rx * hw, lz: z - rz * hw, gx: x + rx * hw, gz: z + rz * hw };
    if (!prev) {
      this.last[id] = cur;
      return;
    }
    const d = Math.hypot(x - prev.x, z - prev.z);
    if (d < 0.18) return;
    if (d > 3) {
      this.last[id] = cur; // salto (reset): no unir tramos
      return;
    }
    const i = this.count % this.max;
    const y = 0.012;
    this.positions.set(
      [prev.lx, y, prev.lz, prev.gx, y, prev.gz, cur.lx, y, cur.lz, cur.gx, y, cur.gz],
      i * 12,
    );
    this.count++;
    this.geometry.setDrawRange(0, Math.min(this.count, this.max) * 6);
    this.attr.needsUpdate = true;
    this.last[id] = cur;
  }

  lift(id) {
    delete this.last[id];
  }

  clear() {
    this.count = 0;
    this.last = {};
    this.positions.fill(0);
    this.attr.needsUpdate = true;
    this.geometry.setDrawRange(0, 0);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

// ---------------------------------------------------------------------------
// Humo: sprites crema que crecen, suben y se desvanecen (pool reutilizable)
// ---------------------------------------------------------------------------
function puffTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255,253,246,1)');
  grad.addColorStop(0.5, 'rgba(246,240,226,0.55)');
  grad.addColorStop(1, 'rgba(246,240,226,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Smoke {
  constructor(scene, size = 140) {
    this.texture = puffTexture();
    this.pool = [];
    for (let i = 0; i < size; i++) {
      const mat = new THREE.SpriteMaterial({ map: this.texture, transparent: true, depthWrite: false, opacity: 0 });
      const s = new THREE.Sprite(mat);
      s.visible = false;
      scene.add(s);
      this.pool.push({ sprite: s, life: 0, max: 1, vx: 0, vz: 0, grow: 1 });
    }
    this.next = 0;
  }

  emit(x, z, vx, vz, strength) {
    const p = this.pool[this.next];
    this.next = (this.next + 1) % this.pool.length;
    p.life = p.max = 0.9 + Math.random() * 0.8;
    p.vx = vx * 0.25 + (Math.random() - 0.5) * 1.2;
    p.vz = vz * 0.25 + (Math.random() - 0.5) * 1.2;
    p.grow = 1.2 + strength * 1.6;
    p.sprite.position.set(x, 0.35, z);
    p.sprite.scale.setScalar(0.6);
    p.sprite.material.opacity = 0.3 * strength + 0.08;
    p.alpha = p.sprite.material.opacity;
    p.sprite.visible = true;
  }

  update(dt) {
    for (const p of this.pool) {
      if (p.life <= 0) continue;
      p.life -= dt;
      const k = 1 - p.life / p.max;
      p.sprite.position.x += p.vx * dt;
      p.sprite.position.z += p.vz * dt;
      p.sprite.position.y += 0.9 * dt;
      p.sprite.scale.setScalar(0.6 + k * p.grow * 2);
      p.sprite.material.opacity = p.alpha * (1 - k);
      if (p.life <= 0) p.sprite.visible = false;
    }
  }

  dispose() {
    this.texture.dispose();
    for (const p of this.pool) p.sprite.material.dispose();
  }
}
