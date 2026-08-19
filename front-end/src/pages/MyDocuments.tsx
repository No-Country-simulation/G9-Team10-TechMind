import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Upload, RefreshCw, Search, X, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { DocumentDetailModal } from '@/components/ui/DocumentDetailModal';
import { Pagination } from '@/components/ui/Pagination';
import { ROUTES, CATEGORY_COLORS, THEME } from '@/utils/constants';
import { documentService } from '@/services/api';
import type { DocumentResponse } from '@/types';
import './MyDocuments.css';

const PAGE_SIZE = 12;

function docToCard(doc: DocumentResponse) {
  return {
    id: doc.docId,
    title: doc.title,
    description: doc.content?.slice(0, 140) + (doc.content?.length > 140 ? '…' : ''),
    category: doc.categoria && doc.categoria.trim() !== '' ? doc.categoria : 'General',
    tags: doc.keywords?.slice(0, 3) ?? [],
    similarity: Math.round((doc.probabilidadCategoria ?? 0.85) * 100),
    recommended: (doc.probabilidadCategoria ?? 0) >= 0.90,
  };
}

export function MyDocuments() {
  const [allDocs, setAllDocs] = useState<DocumentResponse[]>([]);
  const [docs, setDocs] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exactTitle, setExactTitle] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchActive, setSearchActive] = useState(false);
  const [searchMessage, setSearchMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'recent-desc' | 'recent-asc' | 'prec-desc' | 'title-asc'>('recent-desc');
  const [selectedDoc, setSelectedDoc] = useState<DocumentResponse | null>(null);

  // Carga inicial de todos los documentos
  const loadAll = useCallback(async () => {
    setLoading(true);
    setSearchQuery('');
    setSelectedCategory('Todas');
    setSearchActive(false);
    setSearchMessage(null);
    setCurrentPage(1);
    try {
      const data = await documentService.getAll();
      setAllDocs(data);
      setDocs(data);
    } catch {
      setAllDocs([]);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Lista de categorías únicas presentes en los documentos
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    allDocs.forEach(d => {
      if (d.categoria && d.categoria.trim()) cats.add(d.categoria.trim());
    });
    return ['Todas', ...Array.from(cats).sort()];
  }, [allDocs]);

  // Ejecución de la búsqueda
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();

    if (!q) {
      // Si la búsqueda está vacía pero hay categoría seleccionada, filtramos solo por categoría
      if (selectedCategory !== 'Todas') {
        const filtered = allDocs.filter(d => (d.categoria || 'General') === selectedCategory);
        setDocs(filtered);
        setSearchActive(true);
        setSearchMessage({
          text: `Mostrando ${filtered.length} documento(s) en la categoría "${selectedCategory}"`,
          type: 'info'
        });
      } else {
        setDocs(allDocs);
        setSearchActive(false);
        setSearchMessage(null);
      }
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    setSearchMessage(null);
    setCurrentPage(1);
    setSearchActive(true);

    // ─────────────────────────────────────────────────────────────
    // 1. MODO: BÚSQUEDA POR TÍTULO EXACTO
    // ─────────────────────────────────────────────────────────────
    if (exactTitle) {
      try {
        const doc = await documentService.getByTitle(q);
        if (doc && doc.title) {
          setDocs([doc]);
          setSearchMessage({
            text: `Documento encontrado por título exacto: "${doc.title}"`,
            type: 'success'
          });
        } else {
          throw new Error('Not found');
        }
      } catch {
        // Respaldo local por si hay diferencias de mayúsculas/minúsculas
        const localExact = allDocs.filter(d => d.title?.trim().toLowerCase() === q.toLowerCase());
        if (localExact.length > 0) {
          setDocs(localExact);
          setSearchMessage({
            text: `Documento encontrado por título exacto: "${localExact[0].title}"`,
            type: 'success'
          });
        } else {
          setDocs([]);
          setSearchMessage({
            text: `No se encontró ningún documento con el título exacto "${q}". Puedes desmarcar la opción de título exacto para buscar por coincidencias y palabras clave.`,
            type: 'error'
          });
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // 2. MODO: BÚSQUEDA INTELIGENTE / FLEXIBLE / POR CONTENIDO Y KEYWORDS
    // ─────────────────────────────────────────────────────────────
    const qLower = q.toLowerCase();
    const qWords = qLower.split(/\s+/).filter(Boolean);

    // Filtro local exhaustivo (título, contenido, categoría, palabras clave)
    const localMatches = allDocs.filter(doc => {
      const title = doc.title?.toLowerCase() ?? '';
      const content = doc.content?.toLowerCase() ?? '';
      const cat = doc.categoria?.toLowerCase() ?? '';
      const keywords = (doc.keywords ?? []).map(k => k.toLowerCase());

      // Coincidencia directa completa
      if (title.includes(qLower) || content.includes(qLower) || cat.includes(qLower)) return true;
      if (keywords.some(k => k.includes(qLower))) return true;

      // Coincidencia de todas las palabras buscadas
      const matchesAllWords = qWords.every(w =>
        title.includes(w) || content.includes(w) || cat.includes(w) || keywords.some(k => k.includes(w))
      );
      if (matchesAllWords) return true;

      return false;
    });

    let mergedResults = [...localMatches];

    // Intentar complementar con búsqueda semántica y de keywords en el backend (si está disponible)
    try {
      const [backendSearch, keywordSearch] = await Promise.allSettled([
        documentService.search(q, 20),
        documentService.getByKeyword(q)
      ]);

      const extraDocs: DocumentResponse[] = [];
      if (backendSearch.status === 'fulfilled' && Array.isArray(backendSearch.value)) {
        extraDocs.push(...backendSearch.value);
      }
      if (keywordSearch.status === 'fulfilled' && Array.isArray(keywordSearch.value)) {
        extraDocs.push(...keywordSearch.value);
      }

      // Fusionar sin duplicados por docId o title
      const existingIds = new Set(mergedResults.map(d => String(d.docId || d.title)));
      extraDocs.forEach(d => {
        const id = String(d.docId || d.title);
        if (!existingIds.has(id)) {
          existingIds.add(id);
          mergedResults.push(d);
        }
      });
    } catch {
      // Si el endpoint de IA falla, los resultados locales ya están listos
    }

    // Filtrar adicionalmente por categoría si el usuario seleccionó una
    if (selectedCategory !== 'Todas') {
      mergedResults = mergedResults.filter(d => (d.categoria || 'General') === selectedCategory);
    }

    if (mergedResults.length > 0) {
      setDocs(mergedResults);
      setSearchMessage({
        text: `Se encontraron ${mergedResults.length} documento(s) relacionados con "${q}"`,
        type: 'info'
      });
    } else {
      setDocs([]);
      setSearchMessage({
        text: `No se encontraron documentos que contengan o se relacionen con "${q}".`,
        type: 'error'
      });
    }

    setLoading(false);
  };

  // Cambio de categoría
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    if (!searchQuery.trim()) {
      if (cat === 'Todas') {
        setDocs(allDocs);
        setSearchActive(false);
        setSearchMessage(null);
      } else {
        const filtered = allDocs.filter(d => (d.categoria || 'General') === cat);
        setDocs(filtered);
        setSearchActive(true);
        setSearchMessage({
          text: `Mostrando ${filtered.length} documento(s) de la categoría "${cat}"`,
          type: 'info'
        });
      }
    }
  };

  // Ordenamiento de documentos
  const sortedDocs = useMemo(() => {
    const list = [...docs];
    if (sortOrder === 'recent-desc') {
      return list.sort((a, b) => {
        const idA = parseInt(String(a.docId || 0), 10) || 0;
        const idB = parseInt(String(b.docId || 0), 10) || 0;
        return idB - idA;
      });
    }
    if (sortOrder === 'recent-asc') {
      return list.sort((a, b) => {
        const idA = parseInt(String(a.docId || 0), 10) || 0;
        const idB = parseInt(String(b.docId || 0), 10) || 0;
        return idA - idB;
      });
    }
    if (sortOrder === 'prec-desc') {
      return list.sort((a, b) => (b.probabilidadCategoria ?? 0) - (a.probabilidadCategoria ?? 0));
    }
    if (sortOrder === 'title-asc') {
      return list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
    }
    return list;
  }, [docs, sortOrder]);

  const totalPages = useMemo(() => Math.ceil(sortedDocs.length / PAGE_SIZE), [sortedDocs.length]);
  const pagedDocs = useMemo(
    () => sortedDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sortedDocs, currentPage]
  );

  return (
    <main className="mydocs-page">
      <header className="mydocs-header fade-up">
        <div>
          <h1 className="page-title">Mis documentos</h1>
          <p className="page-description">
            Gestiona, busca y filtra los contenidos analizados por el modelo de IA ({allDocs.length} documentos totales)
          </p>
        </div>
        <div className="mydocs-actions">
          <Link to={ROUTES.ANALYZE} className="btn btn-ghost">
            <Upload size={16} /> Importar documento
          </Link>
          <Link to={ROUTES.ANALYZE} className="btn btn-primary">
            <Plus size={16} /> Nuevo documento
          </Link>
        </div>
      </header>

      {/* ── Barra de búsqueda y controles ── */}
      <div className="mydocs-controls-card fade-up">
        <form onSubmit={handleSearch} className="mydocs-search-bar">
          <Search size={16} className="mydocs-search-icon" />
          <input
            type="text"
            placeholder="Buscar por palabras clave, tema, contenido o título…"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (!e.target.value.trim() && searchActive) {
                loadAll();
              }
            }}
            className="mydocs-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                if (searchActive) loadAll();
              }}
              className="mydocs-clear-btn"
              title="Limpiar búsqueda"
            >
              <X size={15} />
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-sm mydocs-search-btn">
            Buscar
          </button>

          <div className="mydocs-sort-wrapper">
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="mydocs-sort-select"
            >
              <option value="recent-desc">Más recientes primero</option>
              <option value="recent-asc">Más antiguos primero</option>
              <option value="prec-desc">Mayor precisión / confianza</option>
              <option value="title-asc">Título (A - Z)</option>
            </select>
          </div>
        </form>

        {/* ── Opciones de búsqueda y filtros por categoría ── */}
        <div className="mydocs-filter-row">
          <label className="mydocs-exact-toggle" title="Buscar coincidencia idéntica del título completo en la base de datos">
            <input
              type="checkbox"
              checked={exactTitle}
              onChange={e => setExactTitle(e.target.checked)}
            />
            <span>Búsqueda por título exacto</span>
          </label>

          {availableCategories.length > 1 && (
            <div className="mydocs-category-chips">
              <span className="mydocs-chips-label"><Filter size={12} /> Categoría:</span>
              <div className="mydocs-chips-list">
                {availableCategories.slice(0, 8).map(c => {
                  const isActive = selectedCategory === c;
                  const color = c !== 'Todas' ? (CATEGORY_COLORS[c] ?? THEME.primary) : undefined;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCategoryChange(c)}
                      className={`mydocs-chip ${isActive ? 'active' : ''}`}
                      style={isActive && color ? { background: `${color}25`, borderColor: color, color } : undefined}
                    >
                      {color && <span className="mydocs-chip-dot" style={{ background: color }} />}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Banner de feedback de búsqueda ── */}
      {searchMessage && (
        <div className={`mydocs-message-banner mydocs-message-${searchMessage.type} fade-up`}>
          <div className="mydocs-message-content">
            {searchMessage.type === 'error' ? (
              <AlertCircle size={16} className="mydocs-msg-icon" />
            ) : (
              <CheckCircle2 size={16} className="mydocs-msg-icon" />
            )}
            <span>{searchMessage.text}</span>
          </div>
          {searchActive && (
            <button type="button" onClick={loadAll} className="btn btn-ghost btn-sm mydocs-reset-btn">
              <RefreshCw size={13} /> Ver todos los documentos
            </button>
          )}
        </div>
      )}

      {/* ── Grilla de documentos ── */}
      {loading ? (
        <div className="mydocs-empty fade-up">
          <RefreshCw size={32} className="spin" style={{ color: 'var(--clr-primary)' }} />
          <p>Consultando documentos en la base de datos…</p>
        </div>
      ) : docs.length === 0 ? (
        <div className="mydocs-empty fade-up">
          <FileText size={44} strokeWidth={1.2} style={{ color: 'var(--clr-text-muted)' }} />
          <h3>No se encontraron documentos</h3>
          <p>
            {searchActive
              ? 'Prueba modificando tus términos de búsqueda o desmarcando la opción de título exacto.'
              : 'No hay documentos almacenados en la base de datos.'}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {searchActive && (
              <button type="button" className="btn btn-ghost" onClick={loadAll}>
                <RefreshCw size={14} /> Ver todos ({allDocs.length})
              </button>
            )}
            <Link to={ROUTES.ANALYZE} className="btn btn-primary">
              <Plus size={14} /> Analizar nuevo documento
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mydocs-grid stagger">
            {pagedDocs.map(doc => (
              <div key={doc.docId || doc.title} className="mydocs-card-wrapper">
                <DocumentCard
                  {...docToCard(doc)}
                  onClick={() => setSelectedDoc(doc)}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: 32 }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={page => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}

          {/* Modal de Detalle de Documento con Navegación Continua */}
          {selectedDoc && (
            <DocumentDetailModal
              doc={selectedDoc}
              onClose={() => setSelectedDoc(null)}
              onSelectDoc={setSelectedDoc}
            />
          )}
        </>
      )}
    </main>
  );
}
