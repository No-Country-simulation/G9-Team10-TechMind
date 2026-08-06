import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { CATEGORY_COLORS, ROUTES, THEME } from '@/utils/constants';
import { documentService } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import type { DocumentResponse } from '@/types';
import './Search.css';

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
      return;
    }
    setLoading(true);
    setSearchError(null);

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
        // 3️⃣ Fallback final: filtro local sobre todos los docs
        const q2 = q.toLowerCase();
        setDocs(allDocs.filter(d =>
          (d.title?.toLowerCase().includes(q2)) ||
          (d.keywords?.some(k => k?.toLowerCase().includes(q2)))
        ));
        setSearchMode('all');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ q: query, ...(selectedCats[0] ? { cat: selectedCats[0] } : {}) });
    runSearch(query);
  };

  const toggleFilter = (list: string[], set: (v: string[]) => void, value: string) => {
    set(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
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
            {!loading && results.length === 0 && (
              <div className="results-empty">
                No se encontraron resultados.{' '}
                <Link to={ROUTES.ANALYZE}>Analiza un nuevo documento</Link>
              </div>
            )}
            {results.map((r, i) => (
              <DocumentCard
                key={i}
                {...r}
                showSimilarity={settings.preferences.showSimilarity}
                to={ROUTES.LIBRARY}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
