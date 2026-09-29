import { Link } from 'react-router-dom';
import { useLiveOnScroll } from './useLiveOnScroll';

// Rotaciones leves para que parezcan recortes pegados a mano
const TILTS = ['-rotate-[0.6deg]', 'rotate-[0.5deg]'];

export const ProjectImage = ({ image, title, className = '' }) => (
  <img src={image} alt={title} loading="lazy" className={`w-full h-full object-cover ${className}`} />
);

export const Tape = ({ className = '' }) => (
  <img src="/tape.webp" alt="" aria-hidden="true" className={`tape -translate-x-1/2 ${className}`} />
);

const ProjectCard = ({ project, index }) => {
  const liveRef = useLiveOnScroll();
  return (
  <Link ref={liveRef} to={`/project/${project.slug}`} className="group flex flex-col gap-5 md:gap-7">
    <div
      className={`photo-print p-3 pb-12 transition-transform duration-500 ease-out group-hover:rotate-0 group-hover:-translate-y-1 group-data-live:rotate-0 group-data-live:-translate-y-1 ${
        TILTS[index % TILTS.length]
      }`}
    >
      <Tape className={index % 2 ? 'rotate-2' : '-rotate-3'} />
      <div className="aspect-[4/3] overflow-hidden bg-paper">
        <ProjectImage
          image={project.image}
          title={project.title}
          className="transition-transform duration-700 group-hover:scale-[1.02] group-data-live:scale-[1.02]"
        />
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <h3 className="text-2xl md:text-4xl font-serif font-light tracking-tight leading-tight">
        <span className="group-hover:hand-underline group-data-live:hand-underline">{project.title}</span>
      </h3>
      <p className="text-ink-soft md:text-lg leading-relaxed max-w-xl">{project.description}</p>
      <p className="text-sm text-ink-soft">{project.stack.join(' · ')}</p>
    </div>
  </Link>
  );
};

export default ProjectCard;
