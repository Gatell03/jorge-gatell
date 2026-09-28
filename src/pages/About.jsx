import LearningCard from '../components/LearningCard';
import { usePageTitle } from '../components/usePageTitle';
import { Tape } from '../components/ProjectCard';

const About = () => {
  usePageTitle('Sobre mí');
  return (
    <div className="page grid grid-cols-1 md:grid-cols-[minmax(0,24rem)_1fr] gap-16 md:gap-24 pt-8 md:pt-16">
      {/* Retrato (tools/make_portrait.py): copia en papel con cinta, fija al hacer scroll en escritorio */}
      <div className="flex justify-center md:justify-start md:sticky md:top-12 md:self-start">
        <figure className="photo-print w-full max-w-sm p-3 pb-14 -rotate-[1.2deg]">
          <Tape className="rotate-2" />
          <img src="/retrato.webp" alt="Jorge Gatell" width="800" height="1000" className="w-full aspect-[4/5] object-cover" />
          <figcaption className="absolute bottom-4 inset-x-0 text-center font-serif italic text-lg">Jorge, Zaragoza</figcaption>
        </figure>
      </div>

      <div className="flex flex-col gap-12 md:pt-4">
        <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight leading-tight">
          Un poco sobre <span className="hand-underline">mí</span>.
        </h1>

        <div className="flex flex-col gap-6 text-lg md:text-xl text-ink-soft leading-relaxed max-w-prose">
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

        <LearningCard className="rotate-[0.8deg] max-w-md" />
      </div>
    </div>
  );
};

export default About;
