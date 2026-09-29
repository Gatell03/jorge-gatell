import { useEffect, useRef } from 'react';

// En pantallas táctiles no hay hover: el elemento se "enciende" (atributo data-live) mientras pasa
// por la franja central de la pantalla, y los estilos group-data-live: repiten el efecto del ratón
export const useLiveOnScroll = (rootMargin = '-35% 0px -35% 0px') => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: none)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.dataset.live = '';
        else delete el.dataset.live;
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return ref;
};
