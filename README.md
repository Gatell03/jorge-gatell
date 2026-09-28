# Jorge Gatell · portfolio

Mi web personal: quién soy, mis proyectos, mi trayectoria y un par de juegos. Es mi rincón para probar cosas.

Estética de **papel y tinta**: textura de papel arrugado, recortes pegados con cinta, una estrella dibujada a mano y el amarillo como único color de acento. Tipografías: **Fraunces** (titulares) e **Instrument Sans** (texto).

## Arrancar en local

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

```bash
npm run build     # versión de producción en dist/
npm run lint      # revisar el código
```

## Estructura

```
src/
  pages/        Home, Sobre mí, fichas de proyecto, selector de juegos, 404
  components/   Navbar, Footer (con la carta de contacto), tarjetas de papel, etc.
  data/         projects.js: proyectos, trayectoria, "Ahora mismo" y "Lo que estoy aprendiendo"
  games/
    f18/        El vuelo del F-18 (canvas 2D)
    drift/      Derrapes sobre papel (Three.js, se carga solo al abrir el juego)
    shared/     sonido sintetizado, récords y marco común
public/         imágenes ya optimizadas (WebP), og.png, robots.txt, sitemap.xml
assets-src/     originales de los que salen las imágenes (foto del papel, retrato)
tools/          scripts de Python que generan las imágenes de public/
```

Para cambiar textos de proyectos o trayectoria, casi todo está en `src/data/projects.js`.

## Regenerar imágenes

Necesita Python 3 con Pillow (y `numpy` para el retrato, `python-pptx` para la imagen del generador).

```bash
python tools/make_graphics.py   # papel, cinta, rotulador, ilustraciones, miniaturas, og.png
python tools/make_portrait.py   # retrato de "Sobre mí"
```

## Publicar

La web está preparada para **Vercel**: `vercel.json` hace que recargar rutas como `/about` o `/play/derrapes` no dé 404.

1. Sube el repositorio a GitHub.
2. En vercel.com, *Add New → Project* e importa el repositorio (Vercel detecta Vite solo).
3. A partir de ahí, cada `git push` publica la nueva versión automáticamente.

Si la dirección final no es `https://jorge-gatell.vercel.app`, actualízala en `index.html` (og:url, og:image, canonical y datos de persona), `public/robots.txt` y `public/sitemap.xml`.

## Contacto

El formulario de la carta usa [Formspree](https://formspree.io); los mensajes llegan a mi correo.
