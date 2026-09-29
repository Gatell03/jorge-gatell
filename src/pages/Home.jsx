import { useRef, useState } from 'react';
import ProjectGrid from '../components/ProjectGrid';
import SectionHeading from '../components/SectionHeading';
import NowCard from '../components/NowCard';
import { projects, experience } from '../data/projects';
import { usePageTitle } from '../components/usePageTitle';

// Frase destacada: en escritorio el GIF sigue al cursor; en táctil aparece al tocar.
const Experience = () => {
  const [pos, setPos] = useState(null);
  const hideTimer = useRef(null);

  return (
    <>
      <span
        className="relative whitespace-nowrap bg-ink text-accent px-2 -rotate-1 inline-block cursor-pointer"
        onPointerMove={(e) => e.pointerType === 'mouse' && setPos({ x: e.clientX, y: e.clientY })}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setPos(null)}
        onClick={(e) => {
          if (e.nativeEvent.pointerType === 'mouse') return;
          setPos({ x: e.clientX, y: e.clientY });
          clearTimeout(hideTimer.current);
          hideTimer.current = setTimeout(() => setPos(null), 2500);
        }}
      >
        vivir la experiencia
      </span>
      {pos && (
        <img
          src="/vivir.webp"
          alt=""
          className="fixed w-36 h-36 object-cover border-4 border-card shadow-2xl pointer-events-none z-[100] -translate-x-full -translate-y-full rotate-3"
          style={{ left: pos.x, top: pos.y }}
        />
      )}
    </>
  );
};

const isCurrent = (date) => date.includes('Presente');

const Home = () => {
  usePageTitle(null);
  return (
    <div className="page flex flex-col gap-28 md:gap-40 pt-10 md:pt-20">
      {/* Hero */}
      <header className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-14 lg:gap-24 items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-ink-soft mb-6">Ingeniería Informática · Zaragoza</p>
          <h1 className="text-5xl md:text-8xl xl:text-9xl font-serif font-light tracking-tight leading-[0.95]">
            Hola, soy Jorge.
          </h1>
          <p className="mt-8 md:mt-10 text-xl md:text-[2.1rem] font-serif font-light leading-relaxed md:leading-snug text-ink-soft max-w-3xl">
            Estudio Ingeniería Informática y me apasiona la optimización de sistemas y aprender algo nuevo cada día. Me
            guía una filosofía: <span className="whitespace-nowrap"><Experience />.</span>
          </p>
        </div>
        <NowCard className="rotate-[1.2deg] max-w-sm lg:max-w-none" />
      </header>

      {/* Proyectos */}
      <section id="trabajo" className="flex flex-col gap-16 scroll-mt-8">
        <SectionHeading title="Proyectos" />
        <ProjectGrid projects={projects} />
      </section>

      {/* Trayectoria */}
      <section className="flex flex-col gap-6">
        <SectionHeading title="Trayectoria" />
        <ol>
          {experience.map((item) => (
            <li
              key={item.role}
              className="grid md:grid-cols-[1.3fr_1fr_12rem] gap-1 md:gap-10 md:items-baseline py-6 md:py-7 border-b border-line"
            >
              <span className="text-xl md:text-3xl font-serif font-light leading-snug">{item.role}</span>
              <span className="text-ink-soft md:text-lg">{item.company}</span>
              <span className="text-sm text-ink-soft md:text-right flex items-center gap-2 md:justify-end whitespace-nowrap tabular-nums">
                {isCurrent(item.date) && <span className="w-2 h-2 rounded-full bg-accent ring-1 ring-ink/40" aria-hidden="true" />}
                {item.date}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default Home;
