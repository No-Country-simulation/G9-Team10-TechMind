/**
 * TechMind — Client-Side Cache Service
 *
 * Estrategia de 2 capas:
 *   1. Memoria RAM (Map): acceso <1ms, persiste mientras la pestaña esté abierta.
 *   2. localStorage: persiste entre recargas de página (hasta ~5MB por dominio).
 *
 * Cada entrada tiene un TTL (Time-To-Live). Pasado ese tiempo, el dato se
 * considera "stale" y la próxima petición irá al backend para refrescarlo.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface CacheEntry<T> {
  data: T;
  expiresAt: number; // timestamp UNIX en ms
}

// ── Capa 1: Memoria ────────────────────────────────────────────────────────────
const memoryStore = new Map<string, CacheEntry<unknown>>();

// ── Capa 2: localStorage ───────────────────────────────────────────────────────
const LS_PREFIX = 'tm_cache_';

function lsRead<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

function lsWrite<T>(key: string, entry: CacheEntry<T>): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage lleno — ignorar silenciosamente
  }
}

function lsDelete(key: string): void {
  try {
    localStorage.removeItem(LS_PREFIX + key);
  } catch { /* noop */ }
}

// ── API Pública ────────────────────────────────────────────────────────────────

/**
 * Lee un valor del caché (primero memoria, luego localStorage).
 * Devuelve `null` si no existe o si expiró.
 */
export function cacheGet<T>(key: string): T | null {
  const now = Date.now();

  // Capa 1: memoria
  const memEntry = memoryStore.get(key) as CacheEntry<T> | undefined;
  if (memEntry) {
    if (memEntry.expiresAt > now) return memEntry.data;
    memoryStore.delete(key);
  }

  // Capa 2: localStorage
  const lsEntry = lsRead<T>(key);
  if (lsEntry) {
    if (lsEntry.expiresAt > now) {
      // Promover a memoria para la próxima vez
      memoryStore.set(key, lsEntry);
      return lsEntry.data;
    }
    lsDelete(key);
  }

  return null;
}

/**
 * Guarda un valor en ambas capas (memoria + localStorage).
 * @param key   Clave única para identificar el dato.
 * @param data  Dato a guardar (debe ser serializable a JSON).
 * @param ttlMs Tiempo de vida en milisegundos. Por defecto 5 minutos.
 */
export function cacheSet<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
  memoryStore.set(key, entry as CacheEntry<unknown>);
  lsWrite(key, entry);
}

/**
 * Elimina una entrada específica del caché (ambas capas).
 */
export function cacheInvalidate(key: string): void {
  memoryStore.delete(key);
  lsDelete(key);
}

/**
 * Elimina TODAS las entradas del caché (útil al crear/eliminar documentos).
 */
export function cacheInvalidateAll(): void {
  memoryStore.clear();
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(LS_PREFIX)) keysToRemove.push(k);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

/**
 * Helper: si el dato está en caché lo devuelve; si no, ejecuta `fetcher`,
 * guarda el resultado y lo devuelve. Patrón "cache-aside" clásico.
 *
 * @example
 * const docs = await cacheOrFetch('all_docs', () => documentService.getAll());
 */
export async function cacheOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  cacheSet(key, fresh, ttlMs);
  return fresh;
}
