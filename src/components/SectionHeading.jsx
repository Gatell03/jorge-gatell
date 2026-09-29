// Cabecera de sección común: línea fina de tinta y título en serif.
const SectionHeading = ({ title }) => (
  <div className="border-t border-ink pt-6">
    <h2 className="text-3xl md:text-6xl font-serif font-light tracking-tight">{title}</h2>
  </div>
);

export default SectionHeading;
