// Tipos globales de TechMind

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

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
}

// ── Content Analysis ──────────────────────────────────────────────────────────

export interface ContentInput {
  titulo: string;
  texto: string;
}

export interface ContentAnalysisResult {
  id?: string;
  titulo: string;
  categoria: string;
  probabilidad: number;
  informacion_adicional: string[];
  timestamp?: string;
  texto_preview?: string;
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

export interface DashboardStats {
  total_documentos: number;
  categorias_activas: number;
  precision_promedio: number;
  documentos_hoy: number;
}

export interface RecentActivity {
  id: string;
  titulo: string;
  categoria: string;
  probabilidad: number;
  timestamp: string;
}
