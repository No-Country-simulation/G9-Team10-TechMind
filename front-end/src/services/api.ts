/**
 * Servicio de API — TechMind
 * Todas las llamadas pasan por el proxy de Vite hacia Spring Boot en localhost:8080
 * El proxy reescribe /api/* → /* en el backend.
 */

import type {
  DocumentRequest,
  DocumentResponse,
  KeywordResponse,
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
  create: (req: DocumentRequest) =>
    api.post<DocumentResponse>(API_ENDPOINTS.DOCUMENT.CREATE, req),

  /**
   * Retorna todos los documentos almacenados.
   * GET /document/all
   */
  getAll: () =>
    api.get<DocumentResponse[]>(API_ENDPOINTS.DOCUMENT.ALL),

  /**
   * Busca un documento por su ID numérico.
   * GET /document/id/{id}
   */
  getById: (id: number) =>
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
  deleteById: (id: number) =>
    api.delete<void>(`${API_ENDPOINTS.DOCUMENT.DELETE_BY_ID}/${id}`),

  /**
   * Elimina un documento por título.
   * DELETE /document/title/{title}
   */
  deleteByTitle: (title: string) =>
    api.delete<void>(`${API_ENDPOINTS.DOCUMENT.DELETE_BY_TITLE}/${encodeURIComponent(title)}`),
};

// ── Keyword Service ───────────────────────────────────────────────────────────

export const keywordService = {
  /**
   * Retorna todas las keywords del sistema.
   * GET /keyword/findAll
   */
  getAll: () =>
    api.get<KeywordResponse[]>(API_ENDPOINTS.KEYWORD.ALL),

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
