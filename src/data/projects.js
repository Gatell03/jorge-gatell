// Única fuente de datos de proyectos y trayectoria.
// Las imágenes son ilustraciones propias (tools/make_graphics.py): no contienen datos clínicos.

export const projects = [
  {
    slug: 'proyecto-alba',
    title: 'Proyecto Alba',
    subtitle: 'Software clínico de cefalometría y ortodoncia en el navegador',
    description:
      'Aplicación web para la consulta de una ortodoncista: trazado cefalométrico sobre radiografías, análisis automáticos y modelos dentales en 3D.',
    stack: ['React', 'TypeScript', 'Konva', 'Three.js', 'Node.js', 'Express', 'MongoDB', 'Claude API'],
    image: '/alba.webp',
    links: {},
    highlights: [
      { value: '6', label: 'análisis cefalométricos' },
      { value: '32', label: 'factores de Ricketts' },
      { value: '3D', label: 'modelos dentales STL' },
      { value: 'IA', label: 'detección de landmarks' },
    ],
    gallery: [], // capturas anonimizadas: [{ src, alt, caption }]
    context:
      'El objetivo era sustituir en la práctica diaria de una ortodoncista la suite de escritorio que se usa en el sector (NemoCeph y NemoCast) por una aplicación web que funcione en Safari y Chrome sobre macOS, con precisión geométrica y sin latencia: si se mueve un punto un milímetro, todo el diagnóstico se recalcula al instante.',
    solution:
      'Un motor vectorial sobre react-konva permite marcar landmarks y hacer zoom sobre radiografías de alta resolución, con detección de puntos asistida por un modelo de visión. Sobre esa geometría se calculan los análisis de Steiner, Tweed, McNamara, Björk-Jarabak, Downs y Ricketts completo (32 factores) con normas ajustadas por edad y sexo, además de la VTO, la predicción de crecimiento y la superposición de estudios. La simulación del perfil sobre la foto usa un thin-plate spline en WebGL, los modelos STL se cargan en un worker y se ven en 3D con Three.js, y cada paciente tiene su ficha, historial e informe en PDF. La geometría clínica está cubierta con tests.',
  },
  {
    slug: 'generador-estudios',
    title: 'Generador de estudios en PowerPoint',
    subtitle: 'Automatización del estudio ortodóncico para macOS',
    description:
      'Con un doble clic en el Mac crea la presentación clínica de cada paciente, más de 40 diapositivas, a partir de sus fotos y datos.',
    stack: ['Python', 'python-pptx', 'Pillow', 'openpyxl', 'Bash', 'AppleScript'],
    image: '/generador.webp',
    links: {},
    highlights: [
      { value: '40+', label: 'diapositivas por estudio' },
      { value: '1', label: 'doble clic en el Mac' },
      { value: '0', label: 'archivos sobrescritos' },
    ],
    gallery: [],
    context:
      'Montar a mano el estudio de cada paciente suponía colocar decenas de fotos en una plantilla de más de 40 diapositivas y rellenar sus datos uno a uno. Quien lo usa no es técnica y trabaja en Mac, así que tenía que ser tan simple como arrastrar las fotos y hacer doble clic.',
    solution:
      'La plantilla tiene huecos con nombre; el programa busca cada foto por nombre en todas las diapositivas (también dentro de grupos), la coloca sin deformarla respetando la capa del marcador y corrige la rotación de la cámara. Las etiquetas {{VARIABLE}} se rellenan desde un Excel aunque PowerPoint las haya partido en trozos. Un lanzador .command prepara su propio entorno de Python la primera vez, avisa con diálogos nativos de macOS y guarda el resultado en el Escritorio sin sobrescribir nunca nada.',
  },
];

export const getProject = (slug) => projects.find((p) => p.slug === slug);

export const experience = [
  {
    role: 'Grado en Ingeniería Informática (2º Año)',
    company: 'Universidad Internacional de La Rioja (UNIR)',
    date: '2025 — Presente',
  },
  {
    role: 'Gestión Logística y Misiones Internacionales',
    company: 'Ala 15 (Fuerzas Armadas)',
    date: '2024 — Presente',
  },
  {
    role: 'Administración de Operaciones e Instrucción',
    company: 'Escuadrón de Apoyo al Despliegue Aéreo (EADA)',
    date: '2021 — 2024',
  },
];

// Ficha rápida (hero y About): solo datos que ya están en la trayectoria
export const now = [
  { label: 'Estudio', value: 'Grado en Ingeniería Informática · UNIR, 2º año' },
  { label: 'Trabajo', value: 'Gestión logística y misiones internacionales · Ala 15' },
  { label: 'Base', value: 'Zaragoza, España' },
];

// "Lo que estoy aprendiendo" (Sobre mí). BORRADOR: cámbialo por lo que estés aprendiendo de verdad.
export const learning = [
  { topic: 'Estructuras de datos y algoritmos', note: 'la base de la carrera en la UNIR' },
  { topic: 'TypeScript y React a fondo', note: 'lo que uso en Alba' },
  { topic: 'Three.js y gráficos 3D', note: 'el visor de modelos y el juego de derrapes' },
  { topic: 'Automatizar tareas con Python', note: 'como el generador de estudios' },
];
