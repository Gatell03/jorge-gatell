import { now } from '../data/projects';
import { Tape } from './ProjectCard';

// Ficha de cartulina: resumen rápido de quién soy ahora mismo
const NowCard = ({ className = '' }) => (
  <aside className={`photo-print p-5 pt-7 md:p-7 md:pt-9 ${className}`}>
    <Tape className="-rotate-2 max-md:!w-24 max-md:!-top-3" />
    <p className="font-serif italic text-base md:text-xl mb-2 md:mb-5">Ahora mismo</p>
    <dl className="flex flex-col gap-2.5 md:gap-4">
      {now.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5 border-t border-line pt-2.5 md:pt-3">
          <dt className="text-[0.65rem] md:text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</dt>
          <dd className="text-sm md:text-base leading-snug">{value}</dd>
        </div>
      ))}
    </dl>
  </aside>
);

export default NowCard;
