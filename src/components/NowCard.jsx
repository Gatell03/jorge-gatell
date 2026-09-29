import { now } from '../data/projects';
import { Tape } from './ProjectCard';

// Ficha de cartulina: resumen rápido de quién soy ahora mismo
const NowCard = ({ className = '' }) => (
  <aside className={`photo-print p-6 pt-8 md:p-7 md:pt-9 ${className}`}>
    <Tape className="-rotate-2" />
    <p className="font-serif italic text-lg md:text-xl mb-4 md:mb-5">Ahora mismo</p>
    <dl className="flex flex-col gap-4">
      {now.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5 border-t border-line pt-3">
          <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</dt>
          <dd className="leading-snug">{value}</dd>
        </div>
      ))}
    </dl>
  </aside>
);

export default NowCard;
