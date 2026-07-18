/**
 * Servicio base de API — TechMind
 * Todas las llamadas pasan por el proxy de Vite hacia Spring Boot en localhost:8080
 */

import type {
  ContentInput,
  ContentAnalysisResult,
  DashboardStats,
  CategoryStat,
  KeywordStat,
  RecentActivity,
} from '@/types';
import { API_ENDPOINTS } from '@/utils/constants';

const BASE_URL = '/api';

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean>;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    );
    url += `?${query.toString()}`;
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = sessionStorage.getItem('token');
  if (token) {
    (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorBody}`);
  }

  if (response.status === 204) return null as T;

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  put: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};

// ── TechMind Domain Services ──────────────────────────────────────────────────

export const contentService = {
  /**
   * Analiza un contenido técnico y retorna clasificación + palabras clave
   */
  analyze: (input: ContentInput) =>
    api.post<ContentAnalysisResult>(API_ENDPOINTS.CONTENT.ANALYZE, input),

  /**
   * Obtiene el historial de análisis
   */
  getHistory: (page = 0, size = 20) =>
    api.get<RecentActivity[]>(API_ENDPOINTS.CONTENT.HISTORY, { params: { page, size } }),

  /**
   * Estadísticas generales del dashboard
   */
  getStats: () =>
    api.get<DashboardStats>(API_ENDPOINTS.CONTENT.STATS),

  /**
   * Estadísticas por categoría
   */
  getCategories: () =>
    api.get<CategoryStat[]>(API_ENDPOINTS.CONTENT.CATEGORIES),

  /**
   * Top palabras clave
   */
  getKeywords: (limit = 20) =>
    api.get<KeywordStat[]>(API_ENDPOINTS.CONTENT.KEYWORDS, { params: { limit } }),
};
