import { learning } from '../data/projects';
import { Tape } from './ProjectCard';

// Nota de papel "Lo que estoy aprendiendo" (Sobre mí), a juego con NowCard
const LearningCard = ({ className = '' }) => (
  <aside className={`photo-print p-5 pt-7 md:p-7 md:pt-9 ${className}`}>
    <Tape className="rotate-2 max-md:!w-24 max-md:!-top-3" />
    <p className="font-serif italic text-base md:text-xl mb-2 md:mb-5">Lo que estoy aprendiendo</p>
    <ul className="flex flex-col gap-2.5 md:gap-4">
      {learning.map(({ topic, note }) => (
        <li key={topic} className="flex gap-3 border-t border-line pt-2.5 md:pt-3">
          <span className="mt-1.5 md:mt-2 w-2 h-2 shrink-0 rounded-full bg-accent ring-1 ring-ink/40" aria-hidden="true" />
          <span className="flex flex-col">
            <span className="text-sm md:text-base leading-snug">{topic}</span>
            <span className="text-xs md:text-sm text-ink-soft">{note}</span>
          </span>
        </li>
      ))}
    </ul>
  </aside>
);

export default LearningCard;
