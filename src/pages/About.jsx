import { Link } from 'react-router-dom';
import LearningCard from '../components/LearningCard';
import Reveal from '../components/Reveal';
import { usePageTitle } from '../components/usePageTitle';
import { Tape } from '../components/ProjectCard';
import { openContact } from '../components/contact';

// Retrato (tools/make_portrait.py): copia en papel con cinta
const Portrait = ({ className = '', small }) => (
  <figure className={`photo-print ${small ? 'p-2 pb-9' : 'p-3 pb-14'} ${className}`}>
    <Tape className={small ? 'rotate-2 !w-20 !-top-3' : 'rotate-2'} />
    <img src="/retrato.webp" alt="Jorge Gatell" width="800" height="1000" className="w-full aspect-[4/5] object-cover" />
    <figcaption className={`absolute inset-x-0 text-center font-serif italic ${small ? 'bottom-2 text-sm' : 'bottom-4 text-lg'}`}>
      Jorge, Zaragoza
    </figcaption>
  </figure>
);

const Label = ({ children, className = '' }) => (
  <span className={`block text-[0.65rem] md:text-xs uppercase tracking-[0.16em] text-ink-soft ${className}`}>{children}</span>
);

// Tarjeta de embarque: el resumen de dónde vengo y hacia dónde voy
const BoardingPass = () => (
  <div className="photo-print flex -rotate-[0.6deg] overflow-hidden">
    <div className="flex-1 min-w-0 p-5 md:p-7 flex flex-col gap-4 md:gap-5">
      <div className="flex items-center justify-between gap-3">
        <Label>Tarjeta de embarque</Label>
        <svg className="w-5 h-5 text-ink-soft shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
        </svg>
      </div>
      <div className="flex items-end justify-between gap-2 font-serif font-light">
        <div>
          <span className="block text-4xl md:text-5xl leading-none tracking-tight">AIR</span>
          <span className="block mt-1.5 font-sans text-xs md:text-sm text-ink-soft">Ejército del Aire</span>
        </div>
        <span className="flex-1 mb-4 border-t border-dashed border-ink/40 relative" aria-hidden="true">
          <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-card px-1 text-sm">✈</span>
        </span>
        <div className="text-right">
          <span className="block text-4xl md:text-5xl leading-none tracking-tight">DEV</span>
          <span className="block mt-1.5 font-sans text-xs md:text-sm text-ink-soft">Ingeniero informático</span>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-3 md:pt-4 text-sm md:text-base">
        <div><dt><Label>Pasajero</Label></dt><dd>Jorge Gatell</dd></div>
        <div><dt><Label>Embarque</Label></dt><dd>2021</dd></div>
        <div><dt><Label>Escala actual</Label></dt><dd>Ala 15 · logística</dd></div>
        <div><dt><Label>Clase</Label></dt><dd>UNIR · 2º, a distancia</dd></div>
      </dl>
    </div>
    {/* Resguardo con borde perforado */}
    <div className="relative w-16 md:w-24 shrink-0 border-l-2 border-dotted border-ink/25 bg-accent-soft/40 flex items-center justify-center">
      <span className="font-serif text-xl md:text-2xl tracking-[0.2em] text-ink/70 [writing-mode:vertical-rl] rotate-180">ZAZ</span>
      <span className="stamp absolute top-1/2 left-1/2 -ml-11 md:-ml-12 -mt-5 w-[5.5rem] md:w-24 py-1 text-center border-2 border-[#b3261e]/80 text-[#b3261e]/85 text-[0.6rem] md:text-xs font-bold uppercase tracking-[0.12em] rounded-sm">
        En vuelo
      </span>
    </div>
  </div>
);

// Mini tarjeta de proyecto dentro del texto
const ProjectChip = ({ to, image, children }) => (
  <Link
    to={to}
    className="group inline-flex items-center gap-2.5 pl-1 pr-3 py-1 bg-card shadow-[0_1px_2px_rgb(31_27_22/0.2),0_6px_14px_-8px_rgb(31_27_22/0.35)] hover:-translate-y-0.5 active:-translate-y-0.5 transition-transform"
  >
    <img src={image} alt="" className="w-9 h-9 object-cover" />
    <span className="text-sm font-medium">{children}</span>
    <span aria-hidden="true" className="text-sm transition-transform group-hover:translate-x-0.5">→</span>
  </Link>
);

const TakeawayCard = ({ title, tilt, children }) => (
  <div className={`photo-print p-4 pt-6 md:p-6 md:pt-8 ${tilt}`}>
    <Tape className="!w-20 !-top-3 rotate-2" />
    <p className="font-serif italic text-base md:text-lg mb-2 md:mb-3">{title}</p>
    {children}
  </div>
);

const About = () => {
  usePageTitle('Sobre mí');
  return (
    <div className="page grid grid-cols-1 md:grid-cols-[minmax(0,24rem)_1fr] gap-16 md:gap-24 pt-4 md:pt-16">
      {/* Escritorio: retrato en su columna, fijo al hacer scroll */}
      <div className="hidden md:flex md:sticky md:top-12 md:self-start">
        <Portrait className="w-full max-w-sm -rotate-[1.2deg]" />
      </div>

      <div className="flex flex-col gap-14 md:gap-20 md:pt-4 max-w-2xl">
        <div className="flex flex-col gap-8 md:gap-10">
          <h1 className="text-4xl md:text-7xl font-serif font-light tracking-tight leading-tight">
            Un poco sobre <span className="hand-underline">mí</span>.
          </h1>

          {/* Móvil: el retrato va pegado junto a la entradilla, como una foto en un cuaderno */}
          <Reveal className="flow-root">
            <Portrait small className="md:hidden float-right w-[42%] max-w-44 ml-5 mb-3 mt-1 rotate-[2.5deg]" />
            <p className="text-xl md:text-3xl font-serif font-light leading-snug md:leading-snug">
              Soy Jorge, vivo en Zaragoza y llevo <span className="mark-draw">dos vidas a la vez</span>: de día, el Ejército
              del Aire; de noche, Ingeniería Informática.
            </p>
            <p className="mt-4 text-ink-soft text-sm md:text-lg leading-relaxed">
              Desde 2021 en el Ejército del Aire y estudiando a distancia en la UNIR, que es la única forma de que me cuadre todo.
            </p>
          </Reveal>
        </div>

        <Reveal>
          <BoardingPass />
        </Reveal>

        <Reveal as="section" className="flex flex-col gap-5">
          <Label>Lo que me engancha</Label>
          <blockquote className="relative pl-7 md:pl-10 font-serif font-light italic text-2xl md:text-4xl leading-snug tracking-tight">
            <span aria-hidden="true" className="absolute -left-1 -top-1.5 text-4xl md:text-6xl text-accent not-italic leading-none">«</span>
            Coger un problema real, de alguien cercano, y convertirlo en algo que{' '}
            <span className="mark-draw">le ahorre tiempo de verdad</span>.
          </blockquote>
          <p className="text-ink-soft md:text-lg leading-relaxed">
            Así nacieron estos dos: empezaron como «a ver si puedo» y acabaron siendo herramientas que se usan.
          </p>
          <div className="flex flex-wrap gap-3">
            <ProjectChip to="/project/proyecto-alba" image="/alba.webp">Proyecto Alba</ProjectChip>
            <ProjectChip to="/project/generador-estudios" image="/generador.webp">Generador de estudios</ProjectChip>
          </div>
        </Reveal>

        <section className="flex flex-col gap-6">
          <Reveal>
            <Label>Lo que me llevo</Label>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 md:gap-6 text-sm md:text-base">
            <Reveal delay={0.05}>
              <TakeawayCard title="Del trabajo" tilt="-rotate-[1.2deg]">
                <ul className="flex flex-col gap-1.5 md:gap-2">
                  {['Organizarme', 'Trabajar con gente muy distinta', 'No dejar nada a medias'].map((t) => (
                    <li key={t} className="flex gap-2 leading-snug">
                      <span aria-hidden="true" className="text-ink-soft">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </TakeawayCard>
            </Reveal>
            <Reveal delay={0.2}>
              <TakeawayCard title="De la carrera" tilt="rotate-[1.4deg] mt-4 md:mt-6">
                <p className="leading-snug">
                  Ver cada semana todo lo que me queda por aprender. <span className="mark-draw">Mi parte favorita.</span>
                </p>
              </TakeawayCard>
            </Reveal>
          </div>
        </section>

        <Reveal>
          <LearningCard className="rotate-[0.8deg] w-[92%] md:w-auto max-w-md" />
        </Reveal>

        <Reveal className="flex flex-col items-start gap-4 border-t border-line pt-8">
          <p className="font-serif font-light text-2xl md:text-3xl leading-snug">
            Esta web es mi rincón para probar cosas. ¿Hablamos?
          </p>
          <button type="button" onClick={openContact} className="group relative -ml-3 px-5 py-2 font-medium">
            <img
              src="/contact.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-fill opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-300"
            />
            <span className="relative">escríbeme →</span>
          </button>
        </Reveal>
      </div>
    </div>
  );
};

export default About;
