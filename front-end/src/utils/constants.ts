// Constantes globales de la aplicación TechMind

export const APP_NAME = 'TechMind';
export const APP_TAGLINE = 'Organización Inteligente del Conocimiento Técnico';

export const ROUTES = {
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

/** Categorías del grid de Inicio (mockup) */
export const HOME_CATEGORIES = [
  { id: 'Backend',       label: 'Backend',        count: 312, color: '#2563EB' },
  { id: 'Frontend',      label: 'Frontend',       count: 248, color: '#08BBD4' },
  { id: 'Data Science',  label: 'Data Science',   count: 156, color: '#7C3AED' },
  { id: 'DevOps',        label: 'DevOps',         count: 187, color: '#22C55E' },
  { id: 'Cloud',         label: 'Cloud',          count: 134, color: '#3B82F6' },
  { id: 'Base de Datos', label: 'Bases de Datos', count: 98,  color: '#14B8A6' },
  { id: 'Arquitectura',  label: 'IA',             count: 89,  color: '#EC4899' },
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
  Backend:         '#2563EB',
  Frontend:        '#08BBD4',
  DevOps:          '#22C55E',
  'Data Science':  '#7C3AED',
  Seguridad:       '#F59E0B',
  Cloud:           '#3B82F6',
  Mobile:          '#EC4899',
  'Base de Datos': '#14B8A6',
  Testing:         '#F97316',
  Arquitectura:    '#8B5CF6',
  Otro:            '#64748B',
};

export const CHART_PALETTE = [
  '#2563EB', '#7C3AED', '#08BBD4', '#22C55E',
  '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6',
  '#F97316', '#8B5CF6', '#EF4444', '#0EA5E9',
  '#E11D48', '#84CC16', '#6366F1',
];
