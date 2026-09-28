import { Link } from 'react-router-dom';
import AnimatedDrawing from '../components/AnimatedDrawing';
import { usePageTitle } from '../components/usePageTitle';

const NotFound = () => {
  usePageTitle('Página no encontrada');
  return (
    <div className="flex flex-col items-center text-center gap-6 px-6 pt-16 pb-8">
      <AnimatedDrawing className="w-24 h-auto rotate-12" />
      <h1 className="text-7xl md:text-9xl font-serif font-light">404</h1>
      <p className="font-serif italic text-2xl text-ink-soft">Esta página se ha perdido por el camino.</p>
      <Link to="/" className="mt-4 bg-ink text-paper px-8 py-3 rounded-full font-medium hover:bg-ink-soft transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
