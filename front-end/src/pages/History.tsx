import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, ChevronDown, Check, RefreshCw, Trash2 } from 'lucide-react';
import { CATEGORY_COLORS } from '@/utils/constants';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { documentService } from '@/services/api';
import type { DocumentResponse } from '@/types';
import './HistoryKeywords.css';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

/* ── Custom Dropdown ── */
function CatDropdown({ value, options, onChange }: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const color = value !== 'Todas' ? (CATEGORY_COLORS[value] ?? '#6366f1') : undefined;

  return (
    <div className="cat-dropdown" ref={ref}>
      <button
        type="button"
        className="cat-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {color && <span className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />}
        <span className="cat-trigger-label">{value}</span>
        <ChevronDown size={13} className="cat-chevron" />
      </button>

      {open && (
        <div className="cat-menu" role="listbox">
          {options.map(c => {
            const cColor = c !== 'Todas' ? (CATEGORY_COLORS[c] ?? '#6366f1') : undefined;
            return (
              <div
                key={c}
                role="option"
                aria-selected={c === value}
                className={`cat-option${c === value ? ' active' : ''}`}
                onClick={() => { onChange(c); setOpen(false); }}
              >
                {cColor && <span className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: cColor, flexShrink: 0 }} />}
                {c}
                {c === value && <Check size={11} className="check" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── History Page ── */
export function History() {
  const [docs,    setDocs]    = useState<DocumentResponse[]>([]);
  const [search,  setSearch]  = useState('');
  const [cat,     setCat]     = useState('Todas');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(true);
  const [isDemo,  setIsDemo]  = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await documentService.getAll();
      setDocs(data);
      setIsDemo(false);
    } catch {
      setIsDemo(true);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocs(); }, []);

  const allCats = useMemo(() =>
    ['Todas', ...Array.from(new Set(docs.map(d => d.categoria))).sort()],
    [docs]
  );

  const filtered = useMemo(() => {
    let list = [...docs];
    if (cat !== 'Todas') list = list.filter(d => d.categoria === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.categoria.toLowerCase().includes(q) ||
        d.keywords?.some(k => k.toLowerCase().includes(q))
      );
    }
    // Sort by probabilidadCategoria as proxy (no date field from backend)
    return sortDir === 'desc'
      ? list.sort((a, b) => b.probabilidadCategoria - a.probabilidadCategoria)
      : list.sort((a, b) => a.probabilidadCategoria - b.probabilidadCategoria);
  }, [docs, search, cat, sortDir]);

  const handleDelete = async (doc: DocumentResponse) => {
    if (!window.confirm(`¿Eliminar "${doc.title}"?`)) return;
    setDeleting(doc.docId);
    try {
      await documentService.deleteByTitle(doc.title);
      setDocs(prev => prev.filter(d => d.docId !== doc.docId));
    } catch (e) {
      alert('Error al eliminar el documento.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="page-container">
      <header className="page-header">
        <h1 className="page-title">Historial de Análisis</h1>
        <p className="page-description">Todos los contenidos técnicos procesados por el modelo</p>
      </header>

      {isDemo && (
        <div className="demo-banner" style={{ marginBottom: 20 }}>
          Backend no disponible — sin historial real.
          <button onClick={loadDocs} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--clr-warning)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={11} /> Reintentar
          </button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="history-toolbar">
        <div className="hist-search">
          <Search size={14} className="hist-search-icon" />
          <input
            id="history-search"
            type="text"
            placeholder="Buscar por título, categoría o keyword…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <CatDropdown value={cat} options={allCats} onChange={setCat} />

        <button
          id="history-sort-btn"
          className="hist-sort-btn"
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
        >
          <Filter size={13} />
          {sortDir === 'desc' ? 'Mayor precisión' : 'Menor precisión'}
        </button>

        <button
          className="hist-sort-btn"
          onClick={loadDocs}
          style={{ gap: 5 }}
        >
          <RefreshCw size={13} />
          Actualizar
        </button>

        <span className="hist-count">{filtered.length} resultados</span>
      </div>

      {/* ── Table ── */}
      <div className="history-table-wrap fade-up">
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
            Cargando historial…
          </div>
        ) : (
          <table>
            <colgroup>
              <col className="col-num" />
              <col className="col-titulo" />
              <col className="col-cat" />
              <col className="col-conf" />
              <col style={{ width: 80 }} />
              <col style={{ width: 50 }} />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Precisión</th>
                <th>Nivel</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="table-empty-row">
                  <td colSpan={6}>
                    {docs.length === 0
                      ? 'No hay documentos aún — analiza tu primer contenido'
                      : 'No se encontraron resultados'}
                  </td>
                </tr>
              ) : filtered.map((doc, i) => {
                const col = CATEGORY_COLORS[doc.categoria] ?? '#6366f1';
                const pct = Math.round(doc.probabilidadCategoria * 100);
                return (
                  <tr key={doc.docId} style={{ animationDelay: `${i * 0.035}s` }}>
                    <td className="td-num col-num">{i + 1}</td>
                    <td className="td-titulo">
                      <div>{doc.title}</div>
                      {doc.keywords?.length > 0 && (
                        <div style={{ marginTop: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {doc.keywords.slice(0, 4).map(kw => (
                            <span key={kw} style={{
                              fontSize: '0.65rem',
                              background: 'var(--clr-surface)',
                              border: '1px solid var(--clr-border)',
                              borderRadius: 4,
                              padding: '1px 6px',
                              color: 'var(--clr-text-muted)',
                            }}>{kw}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className="cat-badge"
                        style={{ background: `${col}14`, color: col, border: `1px solid ${col}28` }}
                      >
                        <CategoryIcon category={doc.categoria} size={14} />
                        <span>{doc.categoria}</span>
                      </span>
                    </td>
                    <td>
                      <div className="conf-cell">
                        <div className="mini-bar-bg">
                          <div className="mini-bar-fill" style={{ width: `${pct}%`, background: col }} />
                        </div>
                        <span className="conf-val">{pct}%</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>
                      {doc.nivel ?? '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={deleting === doc.docId}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: deleting === doc.docId ? 'var(--clr-text-muted)' : 'var(--clr-danger)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          opacity: 0.6,
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                        title="Eliminar documento"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
