import LearningCard from '../components/LearningCard';
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

const About = () => {
  usePageTitle('Sobre mí');
  return (
    <div className="page grid grid-cols-1 md:grid-cols-[minmax(0,24rem)_1fr] gap-16 md:gap-24 pt-4 md:pt-16">
      {/* Escritorio: retrato en su columna, fijo al hacer scroll */}
      <div className="hidden md:flex md:sticky md:top-12 md:self-start">
        <Portrait className="w-full max-w-sm -rotate-[1.2deg]" />
      </div>

      <div className="flex flex-col gap-10 md:gap-12 md:pt-4">
        <h1 className="text-4xl md:text-7xl font-serif font-light tracking-tight leading-tight">
          Un poco sobre <span className="hand-underline">mí</span>.
        </h1>

        {/* Móvil: el retrato va pegado junto al texto, como una foto en un cuaderno */}
        <div className="flow-root">
          <Portrait small className="md:hidden float-right w-[42%] max-w-44 ml-5 mb-3 mt-2 rotate-[2.5deg]" />
          <div className="space-y-5 md:space-y-6 text-base md:text-xl text-ink-soft leading-relaxed max-w-prose">
            <p>
              Soy Jorge y vivo en Zaragoza. Desde 2021 trabajo en el Ejército del Aire, ahora en el Ala 15 llevando temas de
              logística, y a la vez estudio segundo de Ingeniería Informática en la UNIR. A distancia, que es la única forma de
              que me cuadre todo.
            </p>
            <p>
              Lo que más me engancha de programar es coger un problema real, de alguien que tengo cerca, y convertirlo en algo
              que le ahorre tiempo de verdad. De ahí salieron Alba y el generador de estudios: empezaron como «a ver si puedo» y
              acabaron siendo herramientas que se usan.
            </p>
            <p>
              Del trabajo me traigo cosas bastante prácticas: organizarme, trabajar con gente muy distinta y no dejar las cosas a
              medias. De la carrera, darme cuenta cada semana de todo lo que me queda por aprender, que sinceramente es la parte
              que más me gusta.
            </p>
            <p>
              Esta web es mi rincón para probar cosas. Si te apetece hablar de un proyecto, de una idea o de lo que sea, abajo
              tienes cómo escribirme.
            </p>
          </div>
        </div>

        <LearningCard className="rotate-[0.8deg] max-w-md" />
      </div>
    </div>
  );
};

export default About;
