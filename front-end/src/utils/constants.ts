// Constantes globales de la aplicación TechMind

export const APP_NAME = 'TechMind';
export const APP_TAGLINE = 'Organización Inteligente de Contenido Técnico';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ANALYZE: '/analyze',
  HISTORY: '/history',
  KEYWORDS: '/keywords',
} as const;

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

export const CATEGORY_COLORS: Record<string, string> = {
  Backend:      '#6366f1',
  Frontend:     '#06b6d4',
  DevOps:       '#10b981',
  'Data Science': '#a855f7',
  Seguridad:    '#f59e0b',
  Cloud:        '#3b82f6',
  Mobile:       '#ec4899',
  'Base de Datos': '#14b8a6',
  Testing:      '#f97316',
  Arquitectura: '#8b5cf6',
  Otro:         '#64748b',
};

