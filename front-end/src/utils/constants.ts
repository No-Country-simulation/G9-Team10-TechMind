// Constantes globales de la aplicación TechMind

export const APP_NAME = 'TechMind';
export const APP_TAGLINE = 'Organización Inteligente del Conocimiento Técnico';

export const ROUTES = {
  WELCOME: '/welcome',
  HOME: '/inicio',
  SEARCH: '/busqueda',
  LIBRARY: '/biblioteca',
  RECOMMENDATIONS: '/recomendaciones',
  MY_DOCS: '/mis-documentos',
  SETTINGS: '/configuracion',
  DASHBOARD: '/dashboard',
  ANALYZE: '/analyze',
  HISTORY: '/biblioteca',
  KEYWORDS: '/keywords',
} as const;

/** Categorías del grid de Inicio */
export const HOME_CATEGORIES = [
  { id: 'Backend',               label: 'Backend',                count: 312, color: '#2563EB' },
  { id: 'Frontend',              label: 'Frontend',               count: 248, color: '#08BBD4' },
  { id: 'Inteligencia Artificial', label: 'Inteligencia Artificial', count: 189, color: '#EC4899' },
  { id: 'Data Science',          label: 'Data Science',           count: 156, color: '#7C3AED' },
  { id: 'DevOps',                label: 'DevOps',                 count: 187, color: '#22C55E' },
  { id: 'Ciberseguridad',        label: 'Ciberseguridad',         count: 112, color: '#F59E0B' },
  { id: 'Cloud',                 label: 'Cloud',                  count: 134, color: '#3B82F6' },
  { id: 'Base de Datos',         label: 'Bases de Datos',         count: 98,  color: '#14B8A6' },
] as const;

// Endpoints del backend Spring Boot
export const API_ENDPOINTS = {
  DOCUMENT: {
    CREATE:           '/document/create',
    ALL:              '/document/all',
    BY_ID:            '/document/id',
    BY_TITLE:         '/document/title',
    BY_KEYWORD:       '/document/keyword',
    DELETE_BY_ID:     '/document/id',
    DELETE_BY_TITLE:  '/document/title',
  },
  KEYWORD: {
    ALL:              '/keyword/findAll',
    BY_ID:            '/keyword/id',
    BY_KEYWORD:       '/keyword/keyword',
    BY_TITLE:         '/keyword/title',
    DELETE_BY_ID:     '/keyword/id',
    DELETE_BY_KEYWORD:'/keyword/keyword',
  },
} as const;

/** Paleta de marca del design system */
export const THEME = {
  primary:   '#2563EB',
  secondary: '#08BBD4',
  accent:    '#7C3AED',
  success:   '#22C55E',
  warning:   '#F59E0B',
  danger:    '#EF4444',
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Backend:                 '#2563EB',
  Frontend:                '#08BBD4',
  DevOps:                  '#22C55E',
  'Data Science':          '#7C3AED',
  'Inteligencia Artificial':'#EC4899',
  IA:                      '#EC4899',
  Ciberseguridad:          '#F59E0B',
  Seguridad:               '#F59E0B',
  Cloud:                   '#3B82F6',
  'Base de Datos':         '#14B8A6',
  Automatización:          '#06B6D4',
  Automatizacion:          '#06B6D4',
  Sistemas:                '#6366F1',
  'Web Scraping':          '#D946EF',
  Mobile:                  '#F43F5E',
  Testing:                 '#F97316',
  Arquitectura:            '#8B5CF6',
  General:                 '#64748B',
  Otro:                    '#64748B',
  Otras:                   '#64748B',
};

export const CHART_PALETTE = [
  '#2563EB', '#7C3AED', '#EC4899', '#08BBD4', '#22C55E',
  '#F59E0B', '#3B82F6', '#14B8A6', '#F97316', '#8B5CF6',
  '#06B6D4', '#6366F1', '#D946EF', '#F43F5E', '#84CC16'
];

/**
 * Normaliza nombres de categorías crudos del dataset a nombres canónicos limpios
 */
export function normalizeCategory(cat?: string): string {
  if (!cat) return 'General';
  const clean = cat.trim();
  const lower = clean.toLowerCase();

  if (lower === 'ia' || lower.includes('inteligencia artificial') || lower.includes('artificial') || lower.includes('deep learning')) {
    return 'Inteligencia Artificial';
  }
  if (lower.includes('data science') || lower.includes('ciencias de datos') || lower.includes('machine learning') || lower.includes('analytics')) {
    return 'Data Science';
  }
  if (lower.includes('backend') || lower.includes('back-end') || lower.includes('servidor') || lower.includes('spring') || lower.includes('django')) {
    return 'Backend';
  }
  if (lower.includes('frontend') || lower.includes('front-end') || lower.includes('interfaz') || lower.includes('react') || lower.includes('vue')) {
    return 'Frontend';
  }
  if (lower.includes('devops') || lower.includes('ci/cd') || lower.includes('kubernetes') || lower.includes('docker') || lower.includes('terraform')) {
    return 'DevOps';
  }
  if (lower.includes('ciberseguridad') || lower.includes('seguridad') || lower.includes('security') || lower.includes('hacking') || lower.includes('auth')) {
    return 'Ciberseguridad';
  }
  if (lower.includes('cloud') || lower.includes('nube') || lower.includes('aws') || lower.includes('oci') || lower.includes('azure') || lower.includes('gcp')) {
    return 'Cloud';
  }
  if (lower.includes('base de datos') || lower.includes('database') || lower.includes('sql') || lower.includes('nosql') || lower.includes('mysql') || lower.includes('postgres')) {
    return 'Base de Datos';
  }
  if (lower.includes('automatiz') || lower.includes('automation') || lower.includes('scripting') || lower.includes('bot')) {
    return 'Automatización';
  }
  if (lower.includes('scraping') || lower.includes('scrapping') || lower.includes('crawler') || lower.includes('crawling')) {
    return 'Web Scraping';
  }
  if (lower.includes('sistema') || lower.includes('linux') || lower.includes('os') || lower.includes('kernel') || lower.includes('unix')) {
    return 'Sistemas';
  }
  if (lower.includes('mobile') || lower.includes('móvil') || lower.includes('android') || lower.includes('ios') || lower.includes('flutter')) {
    return 'Mobile';
  }
  if (lower.includes('arquitectura') || lower.includes('architecture') || lower.includes('patrones')) {
    return 'Arquitectura';
  }
  if (lower.includes('testing') || lower.includes('qa') || lower.includes('pruebas') || lower.includes('test')) {
    return 'Testing';
  }

  // Capitalización por defecto
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Limpia y formatea títulos que contienen sintaxis Markdown rota, viñetas o badges
 */
export function cleanDocTitle(title?: string): string {
  if (!title) return 'Sin título';
  let t = title.trim();

  // Remover prefijos tipo "Contexto:"
  t = t.replace(/^Contexto:\s*/gi, '');
  // Quitar encabezados markdown (#, ##, ###)
  t = t.replace(/^#+\s*/g, '');
  // Remover imágenes y badges de markdown: [![...](...)](...) o ![...](...)
  t = t.replace(/!\[.*?\]\(.*?\)/g, '');
  // Convertir enlaces [Texto](url) a Texto
  t = t.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  // Remover backticks, asteriscos, corchetes y llaves sueltas
  t = t.replace(/[`*_~[\](){}<>]/g, ' ');
  // Quitar viñetas sueltas al inicio
  t = t.replace(/^[•|\-–—\s\:\/]+/, '');
  // Normalizar espacios múltiples
  t = t.replace(/\s+/g, ' ').trim();

  if (!t || t.length < 2) return title;
  return t;
}

/**
 * Limpia y formatea descripciones eliminando código redundante, backticks y markdown
 */
export function cleanDocDescription(content?: string, maxLength = 130): string {
  if (!content) return '';
  let c = content.trim();

  // Remover prefijos frecuentes
  c = c.replace(/Contexto:\s*/gi, '');
  c = c.replace(/Código de ejemplo:\s*/gi, '');
  // Remover bloques de código markdown redundantes tipo ```python ```python
  c = c.replace(/```[a-zA-Z]*\s*```[a-zA-Z]*/g, ' ');
  c = c.replace(/```[a-zA-Z]*/g, ' ');
  c = c.replace(/```/g, ' ');
  // Remover imágenes y badges
  c = c.replace(/!\[.*?\]\(.*?\)/g, '');
  // Convertir enlaces markdown [Texto](url) a Texto
  c = c.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  // Remover encabezados
  c = c.replace(/#+\s*/g, '');
  // Remover corchetes y llaves huérfanas
  c = c.replace(/[\[\]{}<>]/g, ' ');
  // Normalizar espacios
  c = c.replace(/\s+/g, ' ').trim();

  if (c.length <= maxLength) return c;
  return c.slice(0, maxLength) + '…';
}
