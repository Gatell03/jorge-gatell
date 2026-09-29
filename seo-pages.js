// Plugin de Vite: al compilar, copia dist/index.html en un HTML por página (about.html, project/….html…)
// con su propio título, descripción, vista previa para redes y dirección canónica, más 404.html y sitemap.xml.
// La web se ve y funciona igual: React sigue montando la página en el navegador.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { SITE_URL, pages, notFoundPage } from './src/data/pages.js';

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Sustituye el contenido de una etiqueta del <head> y avisa si ya no existe (para no fallar en silencio)
const replaceTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`seo-pages: no encuentro ${pattern} en index.html`);
  return html.replace(pattern, replacement);
};

const withMeta = (html, { title, description, url }) => {
  const t = escape(title);
  const d = escape(description);
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${t}</title>`);
  html = replaceTag(html, /(<meta name="description" content=")[^"]*/, `$1${d}`);
  html = replaceTag(html, /(<meta property="og:title" content=")[^"]*/, `$1${t}`);
  html = replaceTag(html, /(<meta property="og:description" content=")[^"]*/, `$1${d}`);
  if (url) {
    html = replaceTag(html, /(<meta property="og:url" content=")[^"]*/, `$1${url}`);
    html = replaceTag(html, /(<link rel="canonical" href=")[^"]*/, `$1${url}`);
  }
  return html;
};

// La ficha de persona (JSON-LD) solo tiene sentido en la portada
const withoutPersonData = (html) => html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');

const notFoundHtml = (html) =>
  withoutPersonData(withMeta(html, notFoundPage))
    .replace(/\s*<link rel="canonical"[^>]*>/, '')
    .replace(/\s*<meta property="og:url"[^>]*>/, '')
    .replace('</title>', '</title>\n    <meta name="robots" content="noindex" />');

const sitemap = (lastmod) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((p) => `  <url><loc>${SITE_URL}${p.path === '/' ? '/' : p.path}</loc><lastmod>${lastmod}</lastmod><priority>${p.priority}</priority></url>`)
  .join('\n')}
</urlset>
`;

export default function seoPages() {
  let outDir;
  return {
    name: 'seo-pages',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    async closeBundle() {
      const template = await readFile(join(outDir, 'index.html'), 'utf8');
      const write = async (file, content) => {
        await mkdir(dirname(join(outDir, file)), { recursive: true });
        await writeFile(join(outDir, file), content);
      };

      for (const page of pages) {
        if (page.path === '/') continue; // la portada es el propio index.html
        const html = withoutPersonData(withMeta(template, { ...page, url: SITE_URL + page.path }));
        await write(`${page.path.slice(1)}.html`, html);
      }
      await write('404.html', notFoundHtml(template));
      await write('sitemap.xml', sitemap(new Date().toISOString().slice(0, 10)));
    },
  };
}
