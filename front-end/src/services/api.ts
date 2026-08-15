/**
 * Servicio de API — TechMind
 * Todas las llamadas pasan por el proxy de Vite hacia Spring Boot en localhost:8080
 * El proxy reescribe /api/* → /* en el backend.
 */

import type {
  DocumentRequest,
  DocumentResponse,
  KeywordResponse,
  RecommendResponse,
} from '@/types';
import { API_ENDPOINTS } from '@/utils/constants';
import { cacheOrFetch, cacheInvalidateAll } from '@/services/cache';

// ── Claves de caché ───────────────────────────────────────────────────────────
const CACHE_KEYS = {
  ALL_DOCS: 'all_docs',
  ALL_KEYWORDS: 'all_keywords',
} as const;

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

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      errorMsg += ': ' + (body.message ?? body.error ?? JSON.stringify(body));
    } catch {
      errorMsg += ': ' + await response.text().catch(() => '');
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) return null as T;

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};

// ── Document Service ──────────────────────────────────────────────────────────

export const documentService = {
  /**
   * Crea / analiza un documento con IA.
   * POST /document/create  →  { title, content }
   */
  create: async (req: DocumentRequest) => {
    const result = await api.post<DocumentResponse>(API_ENDPOINTS.DOCUMENT.CREATE, req);
    // El corpus cambió — invalidar caché para forzar recarga en próxima consulta
    cacheInvalidateAll();
    return result;
  },

  /**
   * Retorna todos los documentos almacenados.
   * GET /document/all
   * ✅ Cacheado 5 min en memoria + localStorage para consultas ultrarrápidas.
   */
  getAll: () =>
    cacheOrFetch(CACHE_KEYS.ALL_DOCS, () => api.get<DocumentResponse[]>(API_ENDPOINTS.DOCUMENT.ALL)),

  /**
   * Busca un documento por su ID.
   * GET /document/id/{id}
   */
  getById: (id: string) =>
    api.get<DocumentResponse>(`${API_ENDPOINTS.DOCUMENT.BY_ID}/${id}`),

  /**
   * Busca un documento por su título exacto.
   * GET /document/title/{title}
   */
  getByTitle: (title: string) =>
    api.get<DocumentResponse>(`${API_ENDPOINTS.DOCUMENT.BY_TITLE}/${encodeURIComponent(title)}`),

  /**
   * Retorna todos los documentos que contienen una keyword.
   * GET /document/keyword/{keyword}
   */
  getByKeyword: (keyword: string) =>
    api.get<DocumentResponse[]>(`${API_ENDPOINTS.DOCUMENT.BY_KEYWORD}/${encodeURIComponent(keyword)}`),

  /**
   * Elimina un documento por ID.
   * DELETE /document/id/{id}
   */
  deleteById: async (id: string) => {
    await api.delete<void>(`${API_ENDPOINTS.DOCUMENT.DELETE_BY_ID}/${id}`);
    cacheInvalidateAll();
  },

  /**
   * Elimina un documento por título.
   * DELETE /document/title/{title}
   */
  deleteByTitle: async (title: string) => {
    await api.delete<void>(`${API_ENDPOINTS.DOCUMENT.DELETE_BY_TITLE}/${encodeURIComponent(title)}`);
    cacheInvalidateAll();
  },

  /**
   * Solicita al motor de IA los documentos más similares a un docId dado.
   * POST /ai/recommend
   */
  getRecommendations: async (docId: string, topK = 5) => {
    const res = await fetch('/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_id: String(docId), top_k: topK })
    });
    if (!res.ok) throw new Error('Error al obtener recomendaciones');
    return res.json() as Promise<RecommendResponse>;
  },

  /**
   * Búsqueda semántica por texto libre usando el motor de IA.
   * POST /ai/search
   */
  semanticSearch: async (query: string, topK = 3) => {
    const res = await fetch('/ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k: topK })
    });
    if (!res.ok) throw new Error('Error en búsqueda semántica');
    return res.json() as Promise<RecommendResponse>;
  },
};

// ── Keyword Service ───────────────────────────────────────────────────────────

export const keywordService = {
  /**
   * Retorna todas las keywords del sistema.
   * GET /keyword/findAll
   */
  getAll: () =>
    cacheOrFetch(CACHE_KEYS.ALL_KEYWORDS, () => api.get<KeywordResponse[]>(API_ENDPOINTS.KEYWORD.ALL), 10 * 60 * 1000),

  /**
   * Busca una keyword por ID.
   * GET /keyword/id/{id}
   */
  getById: (id: number) =>
    api.get<KeywordResponse>(`${API_ENDPOINTS.KEYWORD.BY_ID}/${id}`),

  /**
   * Busca una keyword por su texto exacto.
   * GET /keyword/keyword/{keyword}
   */
  getByKeyword: (keyword: string) =>
    api.get<KeywordResponse>(`${API_ENDPOINTS.KEYWORD.BY_KEYWORD}/${encodeURIComponent(keyword)}`),

  /**
   * Retorna las keywords asociadas a un documento por su título.
   * GET /keyword/title/{title}
   */
  getByTitle: (title: string) =>
    api.get<KeywordResponse[]>(`${API_ENDPOINTS.KEYWORD.BY_TITLE}/${encodeURIComponent(title)}`),

  /**
   * Elimina una keyword por ID.
   * DELETE /keyword/id/{id}
   */
  deleteById: (id: number) =>
    api.delete<void>(`${API_ENDPOINTS.KEYWORD.DELETE_BY_ID}/${id}`),

  /**
   * Elimina una keyword por su texto.
   * DELETE /keyword/keyword/{keyword}
   */
  deleteByKeyword: (keyword: string) =>
    api.delete<void>(`${API_ENDPOINTS.KEYWORD.DELETE_BY_KEYWORD}/${encodeURIComponent(keyword)}`),
};

// ── contentService alias (backward compat con Analyze.tsx) ───────────────────

/**
 * Compatibilidad con el uso existente en Analyze.tsx.
 * Traduce de ContentInput → DocumentRequest → DocumentResponse → ContentAnalysisResult.
 */
export const contentService = {
  analyze: (input: { titulo: string; texto: string }) =>
    documentService.create({ title: input.titulo, content: input.texto }).then(doc => ({
      id:                    doc.docId,
      titulo:                doc.title,
      categoria:             doc.categoria,
      probabilidad:          doc.probabilidadCategoria,
      informacion_adicional: doc.keywords ?? [],
      timestamp:             new Date().toISOString(),
      texto_preview:         doc.content?.slice(0, 160) + (doc.content?.length > 160 ? '…' : ''),
      nivel:                 doc.nivel,
    })),
};
