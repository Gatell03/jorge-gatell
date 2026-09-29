import { learning } from '../data/projects';
import { Tape } from './ProjectCard';

// Nota de papel "Lo que estoy aprendiendo" (Sobre mí), a juego con NowCard
const LearningCard = ({ className = '' }) => (
  <aside className={`photo-print p-6 pt-8 md:p-7 md:pt-9 ${className}`}>
    <Tape className="rotate-2" />
    <p className="font-serif italic text-lg md:text-xl mb-4 md:mb-5">Lo que estoy aprendiendo</p>
    <ul className="flex flex-col gap-4">
      {learning.map(({ topic, note }) => (
        <li key={topic} className="flex gap-3 border-t border-line pt-3">
          <span className="mt-2 w-2 h-2 shrink-0 rounded-full bg-accent ring-1 ring-ink/40" aria-hidden="true" />
          <span className="flex flex-col">
            <span className="leading-snug">{topic}</span>
            <span className="text-sm text-ink-soft">{note}</span>
          </span>
        </li>
      ))}
    </ul>
  </aside>
);

export default LearningCard;
