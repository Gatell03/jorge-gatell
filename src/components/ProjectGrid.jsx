import ProjectCard from './ProjectCard';

const ProjectGrid = ({ projects }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-x-24">
    {projects.map((project, index) => (
      <ProjectCard key={project.slug} project={project} index={index} />
    ))}
  </div>
);

export default ProjectGrid;
