import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Check, RefreshCw, Plus, Upload, X, Sparkles, FileText, Tag } from 'lucide-react';
import { CATEGORY_COLORS, THEME, ROUTES } from '@/utils/constants';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Pagination } from '@/components/ui/Pagination';
import { documentService } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import type { DocumentResponse, DocumentoSimilitudResponse } from '@/types';
import './HistoryKeywords.css';

const PAGE_SIZE = 30;



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

  const color = value !== 'Todas' ? (CATEGORY_COLORS[value] ?? THEME.primary) : undefined;

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
            const cColor = c !== 'Todas' ? (CATEGORY_COLORS[c] ?? THEME.primary) : undefined;
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
  const { settings } = useSettings();
  const [docs,    setDocs]    = useState<DocumentResponse[]>([]);
  const [search,  setSearch]  = useState('');
  const [cat,     setCat]     = useState('Todas');
  const [sortOption, setSortOption] = useState<'recent-desc' | 'recent-asc' | 'prec-desc' | 'prec-asc'>('recent-desc');
  const [loading, setLoading] = useState(true);

  const [detailDoc, setDetailDoc] = useState<DocumentResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<DocumentoSimilitudResponse[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Volver a la página 1 cuando se cambia la búsqueda, categoría o el orden
  useEffect(() => {
    setCurrentPage(1);
  }, [search, cat, sortOption]);



  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await documentService.getAll();
      setDocs(data);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocs(); }, []);

  const allCats = useMemo(() =>
    ['Todas', ...Array.from(new Set(docs.map(d => (d.categoria && d.categoria.trim() !== '') ? d.categoria : 'General'))).sort()],
    [docs]
  );

  const filtered = useMemo(() => {
    let list = [...docs];
    if (cat !== 'Todas') {
      list = list.filter(d => {
        const catName = (d.categoria && d.categoria.trim() !== '') ? d.categoria : 'General';
        return catName === cat;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        (d.title?.toLowerCase().includes(q)) ||
        (d.categoria?.toLowerCase().includes(q)) ||
        (d.keywords?.some(k => k?.toLowerCase().includes(q)))
      );
    }

    const getItemTime = (item: DocumentResponse) => {
      const anyItem = item as any;
      if (anyItem.fecha) return new Date(anyItem.fecha).getTime();
      if (anyItem.createdAt) return new Date(anyItem.createdAt).getTime();
      if (anyItem.created_at) return new Date(anyItem.created_at).getTime();
      const parsedId = parseInt(String(item.docId || 0), 10);
      return isNaN(parsedId) ? 0 : parsedId;
    };

    if (sortOption === 'recent-desc') {
      return list.sort((a, b) => getItemTime(b) - getItemTime(a));
    }
    if (sortOption === 'recent-asc') {
      return list.sort((a, b) => getItemTime(a) - getItemTime(b));
    }
    if (sortOption === 'prec-desc') {
      return list.sort((a, b) => (b.probabilidadCategoria || 0) - (a.probabilidadCategoria || 0));
    }
    return list.sort((a, b) => (a.probabilidadCategoria || 0) - (b.probabilidadCategoria || 0));
  }, [docs, search, cat, sortOption]);

  const totalPages = useMemo(() => Math.ceil(filtered.length / PAGE_SIZE), [filtered.length]);
  const pagedFiltered = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  const handleRowClick = async (doc: DocumentResponse) => {
    // Si ya está abierto, cerrarlo
    if (detailDoc?.docId === doc.docId) { setDetailDoc(null); return; }
    setDetailDoc(doc); // muestra datos básicos inmediatamente
    setDetailLoading(true);
    setRecsLoading(true);
    try {
      // Carga el documento completo por Título
      const full = await documentService.getByTitle(doc.title);
      setDetailDoc(full);
      
      // Carga documentos recomendados (similitud semántica IA)
      const recs = await documentService.getRecommendations(doc.docId, 3);
      setRecommendations(recs.resultados || []);
    } catch {
      setRecommendations([]);
    } finally {
      setDetailLoading(false);
      setRecsLoading(false);
    }
  };

  return (
    <main className="page-container library-page">
      <header className="library-header fade-up">
        <div>
          <h1 className="page-title">Biblioteca</h1>
          <p className="page-description">Gestiona y explora todo el corpus de contenido técnico</p>
        </div>
        <div className="library-actions">
          <Link to={ROUTES.ANALYZE} className="btn btn-ghost">
            <Upload size={16} /> Importar documento
          </Link>
          <Link to={ROUTES.ANALYZE} className="btn btn-primary">
            <Plus size={16} /> Nuevo documento
          </Link>
        </div>
      </header>



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

        <select 
          value={sortOption} 
          onChange={e => setSortOption(e.target.value as any)}
          style={{
            background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', 
            color: 'var(--clr-text-muted)', borderRadius: 'var(--radius-sm)',
            padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer',
            height: '36px',
            outline: 'none',
          }}
        >
          <option value="recent-desc">Más recientes primero</option>
          <option value="recent-asc">Más antiguos primero</option>
          <option value="prec-desc">Mayor precisión</option>
          <option value="prec-asc">Menor precisión</option>
        </select>

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
      <div className={`history-table-wrap fade-up${settings.preferences.compactView ? ' compact' : ''}`}>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
            Cargando historial…
          </div>
        ) : (
          <table>
            <colgroup>
              <col className="col-num" style={{ width: 65 }} />
              <col className="col-titulo" />
              <col className="col-cat" style={{ width: 160 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 90 }} />
              <col className="col-conf" style={{ width: 140 }} />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Idioma</th>
                <th>Nivel</th>
                <th>Precisión</th>
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
              ) : pagedFiltered.map((doc, i) => {
                const categoryName = (doc.categoria && doc.categoria.trim() !== '') ? doc.categoria : 'General';
                const col = CATEGORY_COLORS[categoryName] ?? THEME.primary;
                const pct = Math.round((doc.probabilidadCategoria || 0) * 100);
                const isActive = detailDoc?.docId === doc.docId;
                const rowNum = (currentPage - 1) * PAGE_SIZE + i + 1;
                return (
                  <tr
                    key={doc.docId}
                    style={{ animationDelay: `${i * 0.035}s`, cursor: 'pointer',
                      background: isActive ? 'var(--clr-primary-alpha, rgba(37,99,235,0.08))' : undefined }}
                    onClick={() => handleRowClick(doc)}
                  >
                    <td className="td-num col-num">{rowNum}</td>
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
                        <CategoryIcon category={categoryName} size={14} />
                        <span>{categoryName}</span>
                      </span>
                    </td>
                    <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>
                      Español
                    </td>
                    <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>
                      {doc.nivel ?? '—'}
                    </td>
                    <td>
                      <div className="conf-cell">
                        <div className="mini-bar-bg">
                          <div className="mini-bar-fill" style={{ width: `${pct}%`, background: col }} />
                        </div>
                        <span className="conf-val">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ marginTop: 24, paddingBottom: 24 }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={page => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </div>
        )}
      </div>
      {/* ── Document Modal (centered, full content) ── */}
      {detailDoc && (
        <div
          className="doc-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setDetailDoc(null); }}
        >
          <div className="doc-modal">

            {/* Header */}
            <div className="doc-modal-header">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
                <div className="doc-modal-icon">
                  <FileText size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 className="doc-modal-title">{detailDoc.title}</h2>
                  <div className="doc-modal-meta">
                    <span className="doc-modal-cat"
                      style={{ background: `${CATEGORY_COLORS[detailDoc.categoria] ?? THEME.primary}18`, color: CATEGORY_COLORS[detailDoc.categoria] ?? THEME.primary }}>
                      <CategoryIcon category={detailDoc.categoria} size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                      {detailDoc.categoria}
                    </span>
                    <span className="doc-modal-conf">{Math.round((detailDoc.probabilidadCategoria || 0) * 100)}% confianza</span>
                    {detailDoc.nivel && (
                      <span className="doc-modal-conf" style={{ opacity: 0.7 }}>· {detailDoc.nivel}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDetailDoc(null)}
                className="doc-modal-close"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Keywords */}
            {detailDoc.keywords && detailDoc.keywords.length > 0 && (
              <div className="doc-modal-keywords">
                <Tag size={13} style={{ color: 'var(--clr-secondary)', flexShrink: 0 }} />
                {detailDoc.keywords.map(kw => (
                  <span key={kw} className="doc-modal-kw-chip">{kw}</span>
                ))}
              </div>
            )}

            {/* Cuerpo principal */}
            <div className="doc-modal-body">
              {detailLoading ? (
                <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.88rem' }}>Cargando contenido completo…</div>
              ) : detailDoc.content ? (
                <p className="doc-modal-content">{detailDoc.content}</p>
              ) : (
                <p style={{ color: 'var(--clr-text-muted)', fontStyle: 'italic', fontSize: '0.88rem' }}>Sin contenido disponible.</p>
              )}

              {/* Recomendaciones Semánticas */}
              <div style={{ marginTop: 32, borderTop: '1px solid var(--clr-border)', paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                  <Sparkles size={14} style={{ color: 'var(--clr-primary)' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Contenido Relacionado</span>
                </div>

                {recsLoading ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)' }}>Analizando similitudes…</div>
                ) : recommendations.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)' }}>No se encontraron documentos similares.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recommendations.map(rec => (
                      <div key={rec.doc_id} style={{
                        background: 'var(--clr-surface)',
                        border: '1px solid var(--clr-border)',
                        borderRadius: 10, padding: '12px 14px',
                      }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{rec.title}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--clr-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{rec.source_type}</span>
                          <span style={{ color: 'var(--clr-primary)', fontWeight: 700 }}>
                            {Math.round(rec.similarity_score * 100)}% similitud
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
