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
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  CONTENT: {
    ANALYZE: '/contenido',
    HISTORY: '/contenido/history',
    STATS: '/contenido/stats',
    KEYWORDS: '/contenido/keywords',
    CATEGORIES: '/contenido/categories',
    BATCH: '/contenido/batch',
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

export const CATEGORY_ICONS: Record<string, string> = {
  Backend:      '⚙️',
  Frontend:     '🎨',
  DevOps:       '🔧',
  'Data Science': '🧠',
  Seguridad:    '🔒',
  Cloud:        '☁️',
  Mobile:       '📱',
  'Base de Datos': '🗄️',
  Testing:      '🧪',
  Arquitectura: '🏗️',
  Otro:         '📄',
};
