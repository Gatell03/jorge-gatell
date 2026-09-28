// Entrada unificada: teclado (WASD / flechas / espacio) y botones táctiles.
const KEYS = {
  KeyW: 'throttle', ArrowUp: 'throttle',
  KeyS: 'brake', ArrowDown: 'brake',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  Space: 'handbrake', ShiftLeft: 'handbrake',
};

export function createInput(target, { onReset, onAny } = {}) {
  const keys = { throttle: false, brake: false, left: false, right: false, handbrake: false };
  const touch = { throttle: false, brake: false, left: false, right: false, handbrake: false };

  const down = (e) => {
    const k = KEYS[e.code];
    if (k) {
      keys[k] = true;
      e.preventDefault();
    }
    if (e.code === 'KeyR') onReset?.();
    onAny?.();
  };
  const up = (e) => {
    const k = KEYS[e.code];
    if (k) keys[k] = false;
  };
  const blur = () => Object.keys(keys).forEach((k) => (keys[k] = false));

  target.addEventListener('keydown', down);
  target.addEventListener('keyup', up);
  window.addEventListener('blur', blur);

  return {
    get state() {
      return {
        throttle: keys.throttle || touch.throttle,
        brake: keys.brake || touch.brake,
        left: keys.left || touch.left,
        right: keys.right || touch.right,
        handbrake: keys.handbrake || touch.handbrake,
      };
    },
    setTouch(name, value) {
      touch[name] = value;
      if (value) onAny?.();
    },
    destroy() {
      target.removeEventListener('keydown', down);
      target.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    },
  };
}
