import { useEffect } from 'react';

const SITE = 'Jorge Gatell';

// Título de la pestaña por página: "Sobre mí · Jorge Gatell"; sin título, el de la portada
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE} · Ingeniería Informática`;
  }, [title]);
}
