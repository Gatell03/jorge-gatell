// Datos para buscadores y vistas previas al compartir: cada página se genera como su propio HTML
// al compilar (seo-pages.js), con su título, descripción y dirección canónica.
// Si cambia la dirección de la web (p. ej. un dominio propio), basta con cambiar SITE_URL.
import { projects } from './projects.js';

export const SITE_URL = 'https://jorge-gatell.vercel.app';
export const SITE_NAME = 'Jorge Gatell';

// Los títulos coinciden con los que pone usePageTitle al navegar por la web
const title = (name) => `${name} · ${SITE_NAME}`;

export const pages = [
  {
    path: '/',
    title: `${SITE_NAME} · Ingeniería Informática`,
    description:
      'Portfolio de Jorge Gatell, estudiante de Ingeniería Informática en Zaragoza. Proyectos, trayectoria y contacto.',
    priority: '1.0',
  },
  {
    path: '/about',
    title: title('Sobre mí'),
    description:
      'Soy Jorge y vivo en Zaragoza. Desde 2021 trabajo en el Ejército del Aire, ahora en el Ala 15 llevando temas de logística, y a la vez estudio segundo de Ingeniería Informática en la UNIR.',
    priority: '0.8',
  },
  ...projects.map((p) => ({
    path: `/project/${p.slug}`,
    title: title(p.title),
    description: p.description,
    priority: '0.8',
  })),
  {
    path: '/play',
    title: title('Juegos'),
    description: 'El vuelo del F-18 y Derrapes sobre papel: dos juegos para el navegador hechos por Jorge Gatell.',
    priority: '0.5',
  },
  {
    path: '/play/f18',
    title: title('El vuelo del F-18'),
    description: 'Esquiva bugs y deadlines, recoge estrellas y cafés. Toca, haz clic o pulsa espacio para volar.',
    priority: '0.4',
  },
  {
    path: '/play/derrapes',
    title: title('Derrapes sobre papel'),
    description: 'Un coche de juguete, una mesa y mucha tinta. Derrapa, encadena y bate tu mejor marca.',
    priority: '0.4',
  },
];

// Cualquier dirección que no sea una de las de arriba: Vercel sirve esta página con un 404 real
export const notFoundPage = {
  title: title('Página no encontrada'),
  description: 'Esta página se ha perdido por el camino.',
};
