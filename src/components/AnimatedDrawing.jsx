// Estrella dibujada a mano: un único WebP animado (antes eran 19 PNG de ~6 MB en total).
export default function AnimatedDrawing({ className = '' }) {
  return (
    <img
      src="/star.webp"
      alt=""
      width="283"
      height="320"
      className={`object-contain select-none ${className}`}
      draggable="false"
    />
  );
}
