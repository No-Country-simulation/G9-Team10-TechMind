import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Loader2, Sparkles, Tag, X } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Pagination } from '@/components/ui/Pagination';
import { CATEGORY_COLORS, ROUTES, THEME } from '@/utils/constants';
import { documentService } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import type { DocumentResponse, DocumentoSimilitudResponse } from '@/types';
import './Search.css';

const PAGE_SIZE = 10;
const LEVELS = ['Principiante', 'Intermedio', 'Avanzado'];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type SearchMode = 'all' | 'keyword' | 'title';

function docToResult(doc: DocumentResponse) {
  return {
    id: doc.docId,
    title: doc.title,
    description: doc.content?.slice(0, 140) + (doc.content?.length > 140 ? '…' : ''),
    category: doc.categoria && doc.categoria.trim() !== '' ? doc.categoria : 'General',
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
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showFilters] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [semanticResults, setSemanticResults] = useState<DocumentoSimilitudResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Carga inicial: todos los documentos
  useEffect(() => {
    documentService.getAll()
      .then(data => { 
        setAllDocs(data); 
        const q = params.get('q');
        if (!q) setDocs(data);
      })
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
      const byKw = await documentService.getByKeyword(q.trim());
      setDocs(byKw);
      setSearchMode('keyword');
    } catch {
      try {
        const byTitle = await documentService.getByTitle(q.trim());
        setDocs([byTitle]);
        setSearchMode('title');
      } catch {
        const q2 = q.toLowerCase();
        const localResults = allDocs.filter(d =>
          (d.title?.toLowerCase().includes(q2)) ||
          (d.keywords?.some(k => k?.toLowerCase().includes(q2)))
        );
        setDocs(localResults);
        setSearchMode('all');

        if (localResults.length === 0) {
          try {
            const semantic = await documentService.semanticSearch(q.trim(), 3);
            setSemanticResults(semantic.resultados ?? []);
          } catch {
            setSemanticResults([]);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [allDocs]);

  useEffect(() => {
    const q = params.get('q');
    if (allDocs.length > 0 && q !== null) {
      runSearch(q);
    }
  }, [params, allDocs, runSearch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentQ = params.get('q') ?? '';
      if (query !== currentQ) {
        setCurrentPage(1);
        setParams(prev => {
          const newParams = new URLSearchParams(prev);
          if (query.trim()) newParams.set('q', query);
          else newParams.delete('q');
          return newParams;
        }, { replace: true });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, params, setParams]);

  // Conteo dinámico de documentos por categoría
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    allDocs.forEach(d => {
      const cat = d.categoria && d.categoria.trim() !== '' ? d.categoria : 'General';
      stats[cat] = (stats[cat] || 0) + 1;
    });
    Object.keys(CATEGORY_COLORS).forEach(c => {
      if (stats[c] === undefined) stats[c] = 0;
    });
    return stats;
  }, [allDocs]);

  // Conjunto de letras iniciales que tienen categorías disponibles
  const lettersWithCategories = useMemo(() => {
    const set = new Set<string>();
    Object.keys(categoryStats).forEach(cat => {
      if (cat) set.add(cat.charAt(0).toUpperCase());
    });
    return set;
  }, [categoryStats]);

  // Categorías filtradas por la letra seleccionada
  const displayedCategories = useMemo(() => {
    const all = Object.keys(categoryStats).sort();
    if (!selectedLetter) return [];
    if (selectedLetter === 'TODAS') return all;
    return all.filter(cat => cat.toUpperCase().startsWith(selectedLetter));
  }, [categoryStats, selectedLetter]);

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

  const totalPages = useMemo(() => Math.ceil(results.length / PAGE_SIZE), [results.length]);
  const pagedResults = useMemo(
    () => results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [results, currentPage]
  );

  const enrichedSemanticResults = useMemo(() => {
    return semanticResults
      .map(sr => {
        const fullDoc = allDocs.find(d => d.docId === sr.doc_id);
        if (!fullDoc) return null;
        return {
          ...docToResult(fullDoc),
          similarity: Math.round(sr.similarity_score * 100),
          recommended: true
        };
      })
      .filter((r): r is ReturnType<typeof docToResult> => r !== null);
  }, [semanticResults, allDocs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setParams({ q: query, ...(selectedCats[0] ? { cat: selectedCats[0] } : {}) });
  };

  const handleLetterClick = (letter: string) => {
    if (letter === 'TODAS') {
      setSelectedLetter(null);
    } else {
      setSelectedLetter(prev => prev === letter ? null : letter);
    }
  };

  const handleCategorySelect = (catName: string) => {
    setCurrentPage(1);
    const newSelected = selectedCats.includes(catName) ? [] : [catName];
    setSelectedCats(newSelected);
    setParams(prev => {
      const p = new URLSearchParams(prev);
      if (newSelected.length > 0) p.set('cat', newSelected[0]);
      else p.delete('cat');
      return p;
    }, { replace: true });
  };

  const toggleFilter = (list: string[], set: (v: string[]) => void, value: string) => {
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

      {/* ── Explorador de Categorías por Abecedario A-Z ── */}
      <section className="search-alpha-section fade-up">
        <div className="search-alpha-header">
          <div className="search-alpha-title">
            <Tag size={16} />
            <span>Explorador de Categorías por Abecedario</span>
          </div>
          {selectedCats.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => {
                setSelectedCats([]);
                setParams(prev => {
                  const p = new URLSearchParams(prev);
                  p.delete('cat');
                  return p;
                }, { replace: true });
              }}
              style={{ fontSize: '0.75rem', gap: 4, color: 'var(--clr-primary)' }}
            >
              <X size={13} /> Limpiar filtro de categoría ({selectedCats[0]})
            </button>
          )}
        </div>

        <div className="search-alpha-strip">
          {ALPHABET.map(letter => {
            const hasCats = letter === 'TODAS' || lettersWithCategories.has(letter);
            const isActive = (letter === 'TODAS' && !selectedLetter) || selectedLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                className={`search-alpha-btn${hasCats ? ' has-cats' : ''}${isActive ? ' active' : ''}`}
                onClick={() => handleLetterClick(letter)}
                title={hasCats ? `Filtrar categorías por la letra ${letter}` : `Sin categorías con la letra ${letter}`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="search-cat-grid">
          {!selectedLetter ? null : displayedCategories.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', padding: '8px 0' }}>
              No se encontraron categorías que comiencen con la letra <strong>'{selectedLetter}'</strong>
            </div>
          ) : (
            displayedCategories.map(cat => {
              const isSelected = selectedCats.includes(cat);
              const col = CATEGORY_COLORS[cat] ?? THEME.primary;
              const count = categoryStats[cat] || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`search-cat-card${isSelected ? ' selected' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                  style={{
                    borderColor: isSelected ? col : undefined,
                    background: isSelected ? `${col}18` : undefined,
                    color: isSelected ? col : undefined,
                  }}
                >
                  <CategoryIcon category={cat} size={14} />
                  <span>{cat}</span>
                  <span className="search-cat-count" style={{ background: isSelected ? `${col}30` : undefined }}>
                    {count}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </section>

      <div className="search-layout">
        {showFilters && (
          <aside className="search-filters fade-up">
            <h3 className="filter-title">Nivel Dificultad</h3>
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
                  fontSize: '0.82rem', color: 'var(--clr-text)',
                }}>
                  <Sparkles size={15} style={{ color: 'var(--clr-primary)' }} />
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
