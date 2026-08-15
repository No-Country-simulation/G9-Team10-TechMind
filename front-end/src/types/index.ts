// Tipos globales de TechMind — alineados con los DTOs del backend Spring Boot

// ── Backend DTOs ───────────────────────────────────────────────────────────────

/** POST /document/create — body */
export interface DocumentRequest {
  title: string;
  content: string;
}

/** POST /document/create — response  |  GET /document/* */
export interface DocumentResponse {
  docId: string;
  traceId: string;
  title: string;
  content: string;
  categoria: string;
  probabilidadCategoria: number;
  nivel: string;
  keywords: string[];
}

/** GET /keyword/* */
export interface KeywordResponse {
  id: number;
  keyword: string;
}

export interface DocumentoSimilitudResponse {
  doc_id: string;
  title: string;
  source_type: string;
  similarity_score: number;
  preview: string;
}

export interface RecommendResponse {
  resultados: DocumentoSimilitudResponse[];
  trace_id: string;
}

// ── Legacy / Dashboard types (mantienen compatibilidad con mock data) ───────────

export interface DashboardStats {
  total_documentos: number;
  categorias_activas: number;
  precision_promedio: number;
  documentos_hoy: number;
  total_keywords?: number;
}

export interface CategoryStat {
  categoria: string;
  count: number;
  porcentaje: number;
  color: string;
}

export interface KeywordStat {
  keyword: string;
  frecuencia: number;
}

/** Derived from DocumentResponse for display in history/activity lists */
export interface RecentActivity {
  id: string;
  titulo: string;
  categoria: string;
  probabilidad: number;
  timestamp: string;
}

/** Used in Analyze page form */
export interface ContentInput {
  titulo: string;
  texto: string;
}

/** Used in Analyze page result display */
export interface ContentAnalysisResult {
  id?: string;
  titulo: string;
  categoria: string;
  probabilidad: number;
  informacion_adicional: string[];
  timestamp?: string;
  texto_preview?: string;
  nivel?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}
