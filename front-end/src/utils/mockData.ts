/**
 * Mock data para el dashboard de TechMind
 * Se usa cuando el backend no está disponible (modo demo)
 */

import type {
  ContentAnalysisResult,
  DashboardStats,
  CategoryStat,
  KeywordStat,
  RecentActivity,
} from '@/types';
import { CATEGORY_COLORS } from '@/utils/constants';

export const mockStats: DashboardStats = {
  total_documentos: 1247,
  categorias_activas: 10,
  precision_promedio: 91.4,
  documentos_hoy: 38,
};

export const mockCategories: CategoryStat[] = [
  { categoria: 'Backend',       count: 312, porcentaje: 25.0, color: CATEGORY_COLORS['Backend'] },
  { categoria: 'Frontend',      count: 248, porcentaje: 19.9, color: CATEGORY_COLORS['Frontend'] },
  { categoria: 'DevOps',        count: 187, porcentaje: 15.0, color: CATEGORY_COLORS['DevOps'] },
  { categoria: 'Data Science',  count: 156, porcentaje: 12.5, color: CATEGORY_COLORS['Data Science'] },
  { categoria: 'Cloud',         count: 134, porcentaje: 10.7, color: CATEGORY_COLORS['Cloud'] },
  { categoria: 'Base de Datos', count: 98,  porcentaje: 7.9,  color: CATEGORY_COLORS['Base de Datos'] },
  { categoria: 'Seguridad',     count: 67,  porcentaje: 5.4,  color: CATEGORY_COLORS['Seguridad'] },
  { categoria: 'Testing',       count: 45,  porcentaje: 3.6,  color: CATEGORY_COLORS['Testing'] },
];

export const mockKeywords: KeywordStat[] = [
  { keyword: 'Spring Boot',      frecuencia: 198 },
  { keyword: 'React',            frecuencia: 176 },
  { keyword: 'Docker',           frecuencia: 154 },
  { keyword: 'Python',           frecuencia: 143 },
  { keyword: 'Machine Learning', frecuencia: 132 },
  { keyword: 'REST API',         frecuencia: 121 },
  { keyword: 'Kubernetes',       frecuencia: 109 },
  { keyword: 'PostgreSQL',       frecuencia: 97  },
  { keyword: 'TypeScript',       frecuencia: 89  },
  { keyword: 'AWS',              frecuencia: 87  },
  { keyword: 'Java',             frecuencia: 76  },
  { keyword: 'Git',              frecuencia: 74  },
  { keyword: 'CI/CD',            frecuencia: 68  },
  { keyword: 'JWT',              frecuencia: 62  },
  { keyword: 'TensorFlow',       frecuencia: 58  },
];

export const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    titulo: 'Introducción a Spring Boot y REST APIs',
    categoria: 'Backend',
    probabilidad: 0.95,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    titulo: 'Configuración de Kubernetes en GCP',
    categoria: 'DevOps',
    probabilidad: 0.91,
    timestamp: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
  },
  {
    id: '3',
    titulo: 'Redes Neuronales con TensorFlow 2.x',
    categoria: 'Data Science',
    probabilidad: 0.88,
    timestamp: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
  },
  {
    id: '4',
    titulo: 'Hooks avanzados en React 19',
    categoria: 'Frontend',
    probabilidad: 0.93,
    timestamp: new Date(Date.now() - 1000 * 60 * 82).toISOString(),
  },
  {
    id: '5',
    titulo: 'Optimización de consultas en PostgreSQL',
    categoria: 'Base de Datos',
    probabilidad: 0.87,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: '6',
    titulo: 'JWT y autenticación en microservicios',
    categoria: 'Seguridad',
    probabilidad: 0.89,
    timestamp: new Date(Date.now() - 1000 * 60 * 165).toISOString(),
  },
];

export const mockAnalysisResult: ContentAnalysisResult = {
  id: 'demo-1',
  titulo: 'Introducción a Spring Boot',
  categoria: 'Backend',
  probabilidad: 0.89,
  informacion_adicional: ['Java', 'Spring Boot', 'API REST', 'Maven', 'Spring MVC'],
  timestamp: new Date().toISOString(),
  texto_preview: 'En este contenido se presentan los conceptos básicos para la creación de APIs REST utilizando Java y Spring Boot.',
};

export const mockWeeklyData = [
  { dia: 'Lun', documentos: 42, promedio_precision: 89 },
  { dia: 'Mar', documentos: 58, promedio_precision: 91 },
  { dia: 'Mié', documentos: 35, promedio_precision: 87 },
  { dia: 'Jue', documentos: 71, promedio_precision: 93 },
  { dia: 'Vie', documentos: 63, promedio_precision: 90 },
  { dia: 'Sáb', documentos: 29, promedio_precision: 92 },
  { dia: 'Dom', documentos: 38, promedio_precision: 91 },
];
