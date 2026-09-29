import LearningCard from '../components/LearningCard';
import Reveal from '../components/Reveal';
import { usePageTitle } from '../components/usePageTitle';
import { Tape } from '../components/ProjectCard';

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

// Tarjeta de embarque: el primer párrafo (trabajo y estudios), con las mismas palabras, en forma de billete
const BoardingPass = () => (
  <div className="photo-print flex -rotate-[0.6deg] overflow-hidden">
    <div className="flex-1 min-w-0 p-5 md:p-7 flex flex-col gap-4 md:gap-5">
      <div className="flex items-center justify-between gap-3">
        <Label>Desde 2021</Label>
        <svg className="w-5 h-5 text-ink-soft shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
        </svg>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 font-serif font-light text-xl md:text-3xl leading-tight tracking-tight">
        <span>Trabajo en el Ejército del Aire</span>
        <span className="text-sm md:text-base text-ink-soft font-sans" aria-hidden="true">+</span>
        <span className="text-right">estudio Ingeniería Informática</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-dashed border-ink/30 pt-3 md:pt-4 text-sm md:text-base">
        <div>
          <dt><Label>Ahora</Label></dt>
          <dd>En el Ala 15, llevando temas de logística</dd>
        </div>
        <div>
          <dt><Label>A la vez</Label></dt>
          <dd>Segundo, en la UNIR</dd>
        </div>
      </dl>
    </div>
    {/* Resguardo con borde perforado: a distancia, la única forma de que cuadre todo */}
    <div className="relative w-20 md:w-28 shrink-0 border-l-2 border-dotted border-ink/25 bg-accent-soft/40 flex flex-col items-center justify-center gap-2 px-2 text-center">
      <span className="stamp inline-block px-1.5 py-1 border-2 border-[#b3261e]/80 text-[#b3261e]/85 text-[0.6rem] md:text-xs font-bold uppercase tracking-[0.1em] rounded-sm">
        A distancia
      </span>
      <span className="text-[0.65rem] md:text-xs leading-snug text-ink-soft italic font-serif">
        la única forma de que me cuadre todo
      </span>
    </div>
  </div>
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

          {/* Móvil: el retrato va pegado junto a la presentación, como una foto en un cuaderno */}
          <Reveal className="flow-root">
            <Portrait small className="md:hidden float-right w-[42%] max-w-44 ml-5 mb-3 mt-1 rotate-[2.5deg]" />
            <p className="text-3xl md:text-5xl font-serif font-light leading-tight tracking-tight">
              Soy Jorge y vivo en <span className="mark-draw">Zaragoza</span>.
            </p>
          </Reveal>
        </div>

        <Reveal>
          <BoardingPass />
        </Reveal>

        <Reveal as="section" className="flex flex-col gap-5 md:gap-6">
          <Label>Lo que más me engancha de programar</Label>
          <blockquote className="relative pl-7 md:pl-10 font-serif font-light italic text-2xl md:text-4xl leading-snug tracking-tight">
            <span aria-hidden="true" className="absolute -left-1 -top-1.5 text-4xl md:text-6xl text-accent not-italic leading-none">«</span>
            Coger un problema real, de alguien que tengo cerca, y convertirlo en algo que{' '}
            <span className="mark-draw">le ahorre tiempo de verdad</span>.
          </blockquote>
          <div className="flex flex-col gap-3">
            <p className="text-ink-soft md:text-lg">De ahí salieron Alba y el generador de estudios:</p>
            {/* De «a ver si puedo» a herramientas que se usan */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-serif text-lg md:text-2xl">
              <span className="text-ink-soft">empezaron como</span>
              <span className="italic">«a ver si puedo»</span>
              <span aria-hidden="true" className="grow-arrow text-ink-soft">→</span>
              <span className="text-ink-soft">y acabaron siendo</span>
              <span className="mark-draw">herramientas que se usan</span>
            </div>
          </div>
        </Reveal>

        <section className="flex flex-col gap-6">
          <Reveal>
            <Label>Lo que me llevo</Label>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 md:gap-6 text-sm md:text-base">
            <Reveal delay={0.05}>
              <TakeawayCard title="Del trabajo" tilt="-rotate-[1.2deg]">
                <p className="text-ink-soft mb-2 leading-snug">Cosas bastante prácticas:</p>
                <ul className="flex flex-col gap-1.5 md:gap-2">
                  {['organizarme', 'trabajar con gente muy distinta', 'no dejar las cosas a medias'].map((t) => (
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
                  Darme cuenta cada semana de todo lo que me queda por aprender,{' '}
                  <span className="mark-draw">que sinceramente es la parte que más me gusta</span>.
                </p>
              </TakeawayCard>
            </Reveal>
          </div>
        </section>

        <Reveal>
          <LearningCard className="rotate-[0.8deg] w-[92%] md:w-auto max-w-md" />
        </Reveal>

        <Reveal className="border-t border-line pt-8">
          <p className="font-serif font-light text-2xl md:text-3xl leading-snug">
            Esta web es mi rincón para <span className="mark-draw">probar cosas</span>.
          </p>
          <p className="mt-3 text-ink-soft md:text-lg leading-relaxed">
            Si te apetece hablar de un proyecto, de una idea o de lo que sea, abajo tienes cómo escribirme.
          </p>
        </Reveal>
      </div>
    </div>
  );
};

export default About;
