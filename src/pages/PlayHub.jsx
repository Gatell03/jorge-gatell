import { Link } from 'react-router-dom';
import { Tape } from '../components/ProjectCard';
import { readRecord } from '../games/shared/useRecord';
import { usePageTitle } from '../components/usePageTitle';
import { useLiveOnScroll } from '../components/useLiveOnScroll';

const GAMES = [
  {
    to: '/play/f18',
    title: 'El vuelo del F-18',
    description: 'Esquiva muros de bugs y deadlines, recoge estrellas y cafés, y gana medallas.',
    image: '/f18-thumb.webp',
    recordKey: 'f18-record',
    recordLabel: 'puntos',
  },
  {
    to: '/play/derrapes',
    title: 'Derrapes sobre papel',
    description: 'Un coche de juguete en 3D sobre la mesa: derrapa, encadena y pinta el papel con tinta.',
    image: '/drift-thumb.webp',
    recordKey: 'drift-record',
    recordLabel: 'mejor derrape',
    extraRecordKey: 'drift-time-record',
    extraRecordLabel: 'en 60 s',
  },
];

const GameCard = ({ game, index }) => {
  const record = readRecord(game.recordKey);
  const extra = game.extraRecordKey ? readRecord(game.extraRecordKey) : 0;
  const liveRef = useLiveOnScroll();
  return (
    <Link ref={liveRef} to={game.to} className="group flex flex-col gap-6">
      <div
        className={`photo-print p-3 pb-12 transition-transform duration-500 ease-out group-hover:rotate-0 group-hover:-translate-y-1 group-data-live:rotate-0 group-data-live:-translate-y-1 ${
          index % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.6deg]'
        }`}
      >
        <Tape className={index % 2 ? 'rotate-2' : '-rotate-3'} />
        <div className="aspect-[4/3] overflow-hidden bg-paper">
          <img src={game.image} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03] group-data-live:scale-[1.03]" />
        </div>
        {(record > 0 || extra > 0) && (
          <span className="absolute bottom-3 right-4 text-xs uppercase tracking-[0.14em] text-ink-soft">
            Récord · {[record > 0 && `${record} ${game.recordLabel}`, extra > 0 && `${extra} ${game.extraRecordLabel}`].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl md:text-4xl font-serif font-light tracking-tight">{game.title}</h2>
        <p className="text-ink-soft md:text-lg leading-relaxed max-w-md">{game.description}</p>
        <span className="relative self-start inline-flex items-center gap-2 px-5 py-2 -ml-5 font-medium">
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 group-data-live:opacity-100 transition-opacity duration-500">
            <img src="/contact.webp" alt="" className="w-full h-full object-fill" />
          </span>
          <span className="relative">Jugar</span>
          <span aria-hidden="true" className="relative transition-transform group-hover:translate-x-1 group-data-live:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
};

const PlayHub = () => {
  usePageTitle('Juegos');
  return (
    <div className="page flex flex-col gap-16 pt-10 md:pt-16">
      <header className="flex flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Un descanso</p>
        <h1 className="text-5xl md:text-8xl font-serif font-light tracking-tight leading-none">Elige juego.</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-x-24">
        {GAMES.map((game, i) => (
          <GameCard key={game.to} game={game} index={i} />
        ))}
      </div>

      <p className="self-start border border-dashed border-ink/40 px-5 py-4 font-serif italic text-lg md:text-xl text-ink-soft -rotate-1">
        Más juegos en camino…
      </p>
    </div>
  );
};

export default PlayHub;
