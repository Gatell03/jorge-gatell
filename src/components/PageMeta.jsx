import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_URL, pages } from '../data/pages';

const setAttr = (selector, attr, value) => document.querySelector(selector)?.setAttribute(attr, value);

// Cada página llega ya con su descripción y dirección canónica (seo-pages.js);
// al navegar dentro de la web se actualizan para que sigan correspondiendo a la página visible.
export default function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = pages.find((p) => p.path === pathname);
    if (!page) return;
    const url = SITE_URL + page.path;
    setAttr('link[rel="canonical"]', 'href', url);
    setAttr('meta[property="og:url"]', 'content', url);
    setAttr('meta[name="description"]', 'content', page.description);
  }, [pathname]);

  return null;
}
