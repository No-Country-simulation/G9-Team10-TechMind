import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2, Sparkles } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { Pagination } from '@/components/ui/Pagination';
import { CATEGORY_COLORS, ROUTES, THEME } from '@/utils/constants';
import { documentService } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import type { DocumentResponse, DocumentoSimilitudResponse } from '@/types';
import './Search.css';

const PAGE_SIZE = 10;

const LEVELS = ['Principiante', 'Intermedio', 'Avanzado'];
const LANGUAGES = ['Español', 'Inglés', 'Portugués'];

type SearchMode = 'all' | 'keyword' | 'title';

function docToResult(doc: DocumentResponse) {
  return {
    id: doc.docId,
    title: doc.title,
    description: doc.content?.slice(0, 140) + (doc.content?.length > 140 ? '…' : ''),
    category: doc.categoria,
    tags: doc.keywords?.slice(0, 3) ?? [],
    similarity: Math.round(doc.probabilidadCategoria * 100),
    recommended: doc.probabilidadCategoria >= 0.88,
  };
}

export function SearchPage() {
  const { settings } = useSettings();
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const initialCat = params.get('cat') ?? '';

  const [query, setQuery] = useState(initialQ);
  const [docs, setDocs] = useState<DocumentResponse[]>([]);
  const [allDocs, setAllDocs] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState<SearchMode>('all');
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCat ? [initialCat] : []);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [semanticResults, setSemanticResults] = useState<DocumentoSimilitudResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Carga inicial: todos los documentos
  useEffect(() => {
    documentService.getAll()
      .then(data => { setAllDocs(data); setDocs(data); })
      .catch(() => { setAllDocs([]); setDocs([]); })
      .finally(() => setLoading(false));
  }, []);

  // Búsqueda con endpoint dedicado del backend
  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setDocs(allDocs);
      setSearchMode('all');
      setSearchError(null);
      setSemanticResults([]);
      return;
    }
    setLoading(true);
    setSearchError(null);
    setSemanticResults([]);

    // Evitar Error 400: Spring Boot rechaza %2F en @PathVariable
    if (q.includes('/') || q.includes('\\')) {
      const q2 = q.toLowerCase();
      setDocs(allDocs.filter(d =>
        (d.title?.toLowerCase().includes(q2)) ||
        (d.keywords?.some(k => k?.toLowerCase().includes(q2)))
      ));
      setSearchMode('all');
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Busca por keyword en el backend
      const byKw = await documentService.getByKeyword(q.trim());
      setDocs(byKw);
      setSearchMode('keyword');
    } catch {
      try {
        // 2️⃣ Fallback: busca por título exacto
        const byTitle = await documentService.getByTitle(q.trim());
        setDocs([byTitle]);
        setSearchMode('title');
      } catch {
        // 3️⃣ Fallback local
        const q2 = q.toLowerCase();
        const localResults = allDocs.filter(d =>
          (d.title?.toLowerCase().includes(q2)) ||
          (d.keywords?.some(k => k?.toLowerCase().includes(q2)))
        );
        setDocs(localResults);
        setSearchMode('all');

        // 4️⃣ Si tampoco hay resultados locales → buscar semánticamente con IA
        if (localResults.length === 0) {
          try {
            const semantic = await documentService.semanticSearch(q.trim(), 3);
            setSemanticResults(semantic.resultados ?? []);
          } catch {
            // Motor semántico no disponible — no bloqueamos la UI
            setSemanticResults([]);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [allDocs]);

  const allCategories = useMemo(() => {
    const fromDocs = allDocs.map(d => d.categoria);
    return [...new Set([...Object.keys(CATEGORY_COLORS), ...fromDocs])].sort();
  }, [allDocs]);

  const results = useMemo(() => {
    let list = docs.map(docToResult);
    if (selectedCats.length) list = list.filter(r => selectedCats.includes(r.category));
    if (selectedLevels.length) {
      list = list.filter(r => {
        const doc = docs.find(d => d.docId === r.id);
        return doc && selectedLevels.includes(doc.nivel);
      });
    }
    return list;
  }, [docs, selectedCats, selectedLevels]);

  // Reset page when results change (new search or filter)
  const totalPages = useMemo(() => Math.ceil(results.length / PAGE_SIZE), [results.length]);
  const pagedResults = useMemo(
    () => results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [results, currentPage]
  );

  // Enriquecer resultados semánticos con datos completos del documento.
  // Filtra resultados "Mock" (IDs que no existen en allDocs).
  const enrichedSemanticResults = useMemo(() => {
    return semanticResults
      .map(sr => {
        const fullDoc = allDocs.find(d => d.docId === sr.doc_id);
        if (!fullDoc) return null; // Ignorar mocks
        return {
          ...docToResult(fullDoc),
          similarity: Math.round(sr.similarity_score * 100), // Usar la precisión real devuelta por la IA
          recommended: true
        };
      })
      .filter((r): r is ReturnType<typeof docToResult> => r !== null);
  }, [semanticResults, allDocs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setParams({ q: query, ...(selectedCats[0] ? { cat: selectedCats[0] } : {}) });
    runSearch(query);
  };

  const toggleFilter = (list: string[], set: (v: string[]) => void, value: string) => {
    // Exclusivo: si ya está seleccionado, se vacía. Si no, se selecciona como único valor.
    set(list.includes(value) ? [] : [value]);
  };

  return (
    <main className="search-page">
      <header className="search-header fade-up">
        <h1 className="page-title">Resultados de búsqueda</h1>
        <form className="search-bar" onSubmit={handleSearch}>
          {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          <input
            type="text"
            placeholder="Buscar por keyword o título…"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) { setDocs(allDocs); setSearchMode('all'); }
            }}
          />
          <button type="button" className="btn btn-ghost btn-sm filter-toggle" onClick={() => setShowFilters(v => !v)}>
            <SlidersHorizontal size={14} />
            Filtros
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>Buscar</button>
        </form>
        {searchMode !== 'all' && !loading && (
          <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginTop: 6 }}>
            {searchMode === 'keyword'
              ? `🔑 Resultados por keyword "${params.get('q')}"`
              : `📄 Resultado por título exacto "${params.get('q')}"`}
            {' — '}
            <button
              type="button"
              onClick={() => { setQuery(''); setDocs(allDocs); setSearchMode('all'); setParams({}); }}
              style={{ background: 'none', border: 'none', color: 'var(--clr-primary)', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
            >
              Ver todos
            </button>
          </p>
        )}
        {searchError && (
          <p style={{ fontSize: '0.78rem', color: 'var(--clr-danger)', marginTop: 4 }}>{searchError}</p>
        )}
      </header>

      <div className="search-layout">
        {showFilters && (
          <aside className="search-filters fade-up">
            <h3 className="filter-title">Nivel</h3>
            <div className="filter-group">
              {LEVELS.map(l => (
                <label key={l} className="filter-check">
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(l)}
                    onChange={() => toggleFilter(selectedLevels, setSelectedLevels, l)}
                  />
                  {l}
                </label>
              ))}
            </div>

            <h3 className="filter-title">Categoría</h3>
            <div className="filter-group">
              {allCategories.slice(0, 8).map(cat => (
                <label key={cat} className="filter-check">
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(cat)}
                    onChange={() => toggleFilter(selectedCats, setSelectedCats, cat)}
                  />
                  <span className="filter-dot" style={{ background: CATEGORY_COLORS[cat] ?? THEME.primary }} />
                  {cat}
                </label>
              ))}
            </div>

            <h3 className="filter-title">Idioma</h3>
            <div className="filter-group">
              {LANGUAGES.map(lang => (
                <label key={lang} className="filter-check">
                  <input
                    type="checkbox"
                    checked={selectedLangs.includes(lang)}
                    onChange={() => toggleFilter(selectedLangs, setSelectedLangs, lang)}
                  />
                  {lang}
                </label>
              ))}
            </div>
          </aside>
        )}

        <section className="search-results">
          <p className="results-count">
            {loading ? 'Buscando…' : `${results.length} resultado${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`}
          </p>
          <div className="results-list stagger">
            {!loading && results.length === 0 && enrichedSemanticResults.length === 0 && (
              <div className="results-empty">
                No se encontraron resultados.{' '}
                <Link to={ROUTES.ANALYZE}>Analiza un nuevo documento</Link>
              </div>
            )}

            {/* Resultados normales */}
            {pagedResults.map((r, i) => (
              <DocumentCard
                key={i}
                {...r}
                showSimilarity={settings.preferences.showSimilarity}
                to={ROUTES.LIBRARY}
              />
            ))}

            {/* Paginación */}
            {!loading && results.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={page => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
            )}

            {/* Fallback semántico con IA cuando no hay resultados exactos */}
            {!loading && results.length === 0 && enrichedSemanticResults.length > 0 && (
              <div style={{ width: '100%' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 16, padding: '10px 14px',
                  background: 'rgba(37,99,235,0.07)',
                  border: '1px solid rgba(37,99,235,0.18)',
                  borderRadius: 10,
                  fontSize: '0.82rem', color: 'var(--clr-primary)',
                }}>
                  <Sparkles size={15} />
                  <span>
                    No se encontró una coincidencia exacta.{' '}
                    <strong>El motor de IA encontró {enrichedSemanticResults.length} documento{enrichedSemanticResults.length !== 1 ? 's' : ''} similares:</strong>
                  </span>
                </div>

                <div className="results-list stagger">
                  {enrichedSemanticResults.map((r, i) => (
                    <DocumentCard
                      key={i}
                      {...r}
                      showSimilarity={true}
                      to={ROUTES.LIBRARY}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
