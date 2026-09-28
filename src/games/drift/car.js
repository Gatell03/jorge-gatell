// Física arcade del coche sobre el plano XZ (Y hacia arriba).
// Rumbo 0 = mirando hacia +Z. Adelante = (sin h, cos h); derecha = (cos h, -sin h).

const ACCEL = 17;
const BRAKE = 26;
const REVERSE = 7;
const MAX_SPEED = 31;
const GRIP = 9;          // agarre lateral normal
const DRIFT_GRIP = 1.6;  // agarre derrapando
const HANDBRAKE_GRIP = 0.7;
const STEER_RATE = 2.5;

export class Car {
  constructor() {
    this.reset(0, -20, 0);
  }

  reset(x, z, heading) {
    this.x = x;
    this.z = z;
    this.heading = heading;
    this.vx = 0;
    this.vz = 0;
    this.yawRate = 0;
    this.steer = 0;
    this.drifting = false;
    this.slip = 0;
    this.speed = 0;
    this.forwardSpeed = 0;
    this.lateral = 0;
    this.accel = 0;
  }

  get fwd() {
    return [Math.sin(this.heading), Math.cos(this.heading)];
  }

  get right() {
    return [Math.cos(this.heading), -Math.sin(this.heading)];
  }

  update(dt, input) {
    const [fx, fz] = this.fwd;
    const [rx, rz] = this.right;
    let vF = this.vx * fx + this.vz * fz;
    let vR = this.vx * rx + this.vz * rz;
    const prevF = vF;

    // Motor y freno
    if (input.throttle) vF += ACCEL * (1 - Math.max(0, vF) / MAX_SPEED) * dt;
    if (input.brake) {
      if (vF > 0.5) vF -= BRAKE * dt;
      else vF -= REVERSE * dt * (vF > -8 ? 1 : 0);
    }
    // Rozamiento de rodadura y aire
    vF -= vF * (input.throttle ? 0.15 : 0.55) * dt;
    if (input.handbrake) vF -= vF * 0.9 * dt;

    // Estado de derrape: entra con freno de mano o mucho ángulo, sale al enderezar
    const speed = Math.hypot(vF, vR);
    const slip = Math.atan2(Math.abs(vR), Math.max(0.1, Math.abs(vF)));
    if (!this.drifting && speed > 7 && (input.handbrake || slip > 0.22)) this.drifting = true;
    if (this.drifting && (slip < 0.1 || speed < 4) && !input.handbrake) this.drifting = false;

    const grip = input.handbrake ? HANDBRAKE_GRIP : this.drifting ? DRIFT_GRIP : GRIP;
    const vRBefore = vR;
    vR *= Math.exp(-grip * dt);
    // Ayuda arcade: al derrapar, parte de la velocidad lateral que "se come" el agarre pasa a ser
    // avance, y el gas empuja más. Así el derrape mantiene la velocidad y se puede encadenar.
    if (this.drifting && vF > 0) {
      vF += Math.abs(vRBefore - vR) * 0.6;
      if (input.throttle) vF += ACCEL * 0.35 * dt;
      vF = Math.min(vF, MAX_SPEED);
    }

    // Dirección: más giro derrapando; el contravolante reduce el ángulo
    const steerTarget = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    this.steer += (steerTarget - this.steer) * Math.min(1, dt * 10);
    const dir = vF >= 0 ? 1 : -1;
    const speedFactor = Math.min(1, speed / 7) * (1 / (1 + speed * 0.025));
    let targetYaw = this.steer * STEER_RATE * speedFactor * dir;
    if (this.drifting) targetYaw *= input.handbrake ? 1.6 : 1.2;
    this.yawRate += (targetYaw - this.yawRate) * Math.min(1, dt * (this.drifting ? 4 : 8));

    // La velocidad se recompone con los ejes de ANTES de girar: al rotar el morro, parte de la
    // velocidad pasa a ser lateral en el siguiente paso. Con agarre se corrige; sin él, el coche desliza.
    this.vx = fx * vF + rx * vR;
    this.vz = fz * vF + rz * vR;
    this.heading += this.yawRate * dt;
    this.x += this.vx * dt;
    this.z += this.vz * dt;

    this.speed = speed;
    this.forwardSpeed = vF;
    this.lateral = vR;
    this.slip = slip;
    this.accel = (vF - prevF) / Math.max(dt, 1e-3);
  }

  // Intensidad del derrape 0..1 (para humo, sonido y marcas)
  get driftAmount() {
    if (!this.drifting || this.speed < 5) return 0;
    return Math.min(1, (this.slip / 0.9) * Math.min(1, this.speed / 14));
  }

  // Rebote contra una superficie con normal (nx, nz)
  bounce(nx, nz, restitution = 0.35) {
    const vn = this.vx * nx + this.vz * nz;
    if (vn < 0) {
      this.vx -= (1 + restitution) * vn * nx;
      this.vz -= (1 + restitution) * vn * nz;
      this.vx *= 0.7;
      this.vz *= 0.7;
    }
    return Math.abs(vn);
  }
}
