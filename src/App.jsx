import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import ProjectDetail from './pages/ProjectDetail';
import PlayHub from './pages/PlayHub';
import NotFound from './pages/NotFound';

// Los juegos se cargan aparte: Three.js solo se descarga al abrir los derrapes
const F18Game = lazy(() => import('./games/f18/F18Game'));
const DriftGame = lazy(() => import('./games/drift/DriftGame'));

const GameLoading = () => (
  <div className="page pt-24 text-center font-serif italic text-2xl text-ink-soft">Preparando el juego…</div>
);

// Cada cambio de página entra con un fundido suave (los #anclas de la misma página no la reinician)
const AnimatedMain = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <main key={pathname} className="flex-grow animate-page">
      {children}
    </main>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="relative isolate min-h-screen text-ink font-sans flex flex-col overflow-x-clip">
        <Navbar />
        <BackToTop />
        <AnimatedMain>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/play" element={<PlayHub />} />
            <Route path="/play/f18" element={<Suspense fallback={<GameLoading />}><F18Game /></Suspense>} />
            <Route path="/play/derrapes" element={<Suspense fallback={<GameLoading />}><DriftGame /></Suspense>} />
            <Route path="/project/:slug" element={<ProjectDetail />} />
            <Route path="/work" element={<Navigate to="/" replace />} />
            <Route path="/contact" element={<Navigate to="/#contacto" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatedMain>
        <div className="page">
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
