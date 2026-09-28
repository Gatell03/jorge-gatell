import { Link, useParams } from 'react-router-dom';
import { projects, getProject } from '../data/projects';
import { ProjectImage, Tape } from '../components/ProjectCard';
import NotFound from './NotFound';
import { usePageTitle } from '../components/usePageTitle';

const LINK_LABELS = { github: 'Código en GitHub', demo: 'Ver demo' };

const Section = ({ title, children }) => (
  <section className="flex flex-col gap-4">
    <h2 className="text-3xl md:text-4xl font-serif font-light text-ink">{title}</h2>
    <p>{children}</p>
  </section>
);

const ProjectDetail = () => {
  const { slug } = useParams();
  const project = getProject(slug);
  usePageTitle(project?.title ?? 'Página no encontrada');
  if (!project) return <NotFound />;

  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  const links = Object.entries(project.links ?? {}).filter(([, url]) => url);

  return (
    <article className="page flex flex-col gap-16 md:gap-24 pt-8 md:pt-12">
      <header className="flex flex-col gap-8">
        <Link to="/#trabajo" className="self-start text-sm text-ink-soft hover:text-ink transition-colors">
          ← Proyectos
        </Link>
        <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tight leading-[1]">{project.title}</h1>
        <p className="text-xl md:text-3xl text-ink-soft font-serif font-light italic max-w-3xl">{project.subtitle}</p>
        {project.highlights?.length > 0 && (
          <dl className="grid grid-cols-2 md:flex md:flex-wrap gap-x-12 gap-y-6 border-t border-line pt-6 mt-2">
            {project.highlights.map(({ value, label }) => (
              <div key={label} className="flex flex-col-reverse gap-1">
                <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</dt>
                <dd className="text-5xl md:text-6xl font-serif font-light leading-none tracking-tight">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      <div className="photo-print p-3 md:p-4 -rotate-[0.3deg] max-w-6xl">
        <Tape className="-rotate-2" />
        <div className="aspect-[4/3] overflow-hidden bg-paper">
          <ProjectImage image={project.image} title={project.title} />
        </div>
      </div>

      {project.gallery?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {project.gallery.map(({ src, alt, caption }, i) => (
            <figure key={src} className={`photo-print p-3 pb-10 ${i % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}>
              <img src={src} alt={alt} loading="lazy" className="w-full aspect-[4/3] object-cover bg-paper" />
              {caption && <figcaption className="absolute bottom-3 inset-x-0 text-center font-serif italic text-ink-soft">{caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-10">
        <aside className="md:col-span-4 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-xs uppercase tracking-[0.14em] text-ink-soft">Herramientas</h2>
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((tool) => (
                <li key={tool} className="px-3 py-1 border border-ink/25 rounded-full text-sm bg-card/60">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
          {links.length > 0 && (
            <div className="flex flex-col gap-2">
              {links.map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4 hover:text-ink-soft">
                  {LINK_LABELS[key] ?? key} ↗
                </a>
              ))}
            </div>
          )}
        </aside>

        <div className="md:col-span-8 flex flex-col gap-14 text-lg md:text-xl leading-relaxed text-ink-soft max-w-3xl">
          {project.context && <Section title="Contexto y reto">{project.context}</Section>}
          {project.solution && <Section title="Solución">{project.solution}</Section>}
        </div>
      </div>

      <Link to={`/project/${next.slug}`} className="group border-t border-ink pt-6 flex flex-col gap-2 md:items-end md:text-right">
        <span className="text-xs uppercase tracking-[0.14em] text-ink-soft">Siguiente proyecto</span>
        <span className="text-4xl md:text-6xl font-serif font-light tracking-tight">
          <span className="group-hover:hand-underline">{next.title}</span>{' '}
          <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </Link>
    </article>
  );
};

export default ProjectDetail;
