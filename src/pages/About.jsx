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

const TakeawayCard = ({ title, tilt, children }) => (
  <div className={`photo-print p-4 pt-6 md:p-6 md:pt-8 ${tilt}`}>
    <Tape className="!w-20 !-top-3 rotate-2" />
    <p className="font-serif italic text-base md:text-xl mb-2 md:mb-4">{title}</p>
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

      {/* Mismo texto de siempre, en bloques que aparecen al bajar y con frases subrayadas con rotulador */}
      <div className="flex flex-col gap-10 md:gap-14 md:pt-4 max-w-2xl text-base md:text-xl text-ink-soft leading-relaxed">
        <h1 className="text-4xl md:text-7xl font-serif font-light tracking-tight leading-tight text-ink">
          Un poco sobre <span className="hand-underline">mí</span>.
        </h1>

        {/* Móvil: el retrato va pegado junto al primer párrafo, como una foto en un cuaderno */}
        <Reveal className="flow-root">
          <Portrait small className="md:hidden float-right w-[42%] max-w-44 ml-5 mb-3 mt-1 rotate-[2.5deg]" />
          <p>
            Soy Jorge y vivo en Zaragoza. Desde 2021 trabajo en el <span className="mark-draw text-ink">Ejército del Aire</span>,
            ahora en el Ala 15 llevando temas de logística, y a la vez estudio segundo de{' '}
            <span className="mark-draw text-ink">Ingeniería Informática</span> en la UNIR. A distancia, que es la única forma
            de que me cuadre todo.
          </p>
        </Reveal>

        <Reveal>
          <p>
            Lo que más me engancha de programar es coger un problema real, de alguien que tengo cerca, y convertirlo en algo
            que <span className="mark-draw text-ink">le ahorre tiempo de verdad</span>. De ahí salieron Alba y el generador de
            estudios: empezaron como «a ver si puedo» y acabaron siendo herramientas que se usan.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 md:gap-8 text-sm md:text-base text-ink">
          <Reveal>
            <TakeawayCard title="Del trabajo" tilt="-rotate-[1.2deg]">
              <p className="text-ink-soft mb-2 leading-snug">Me traigo cosas bastante prácticas:</p>
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

        <Reveal>
          <p>
            Esta web es mi rincón para probar cosas. Si te apetece hablar de un proyecto, de una idea o de lo que sea, abajo
            tienes cómo escribirme.
          </p>
        </Reveal>

        <Reveal className="text-ink">
          <LearningCard className="rotate-[0.8deg] w-[92%] md:w-auto max-w-md" />
        </Reveal>
      </div>
    </div>
  );
};

export default About;
