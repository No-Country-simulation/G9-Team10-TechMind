import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronDown, Check, RefreshCw, Trash2, Plus, Upload, X, BookOpen, Sparkles } from 'lucide-react';
import { CATEGORY_COLORS, THEME, ROUTES } from '@/utils/constants';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { documentService } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import type { DocumentResponse, DocumentoSimilitudResponse } from '@/types';
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
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(true);
  const [isDemo,  setIsDemo]  = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [detailDoc, setDetailDoc] = useState<DocumentResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<DocumentoSimilitudResponse[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        // Si el click fue en un botón de eliminar, no cerrar el drawer aquí (se maneja en su propio onClick)
        const target = e.target as HTMLElement;
        if (target.closest('button[title="Eliminar documento"]')) return;
        
        setDetailDoc(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        (d.title?.toLowerCase().includes(q)) ||
        (d.categoria?.toLowerCase().includes(q)) ||
        (d.keywords?.some(k => k?.toLowerCase().includes(q)))
      );
    }
    // Sort by probabilidadCategoria as proxy (no date field from backend)
    return sortDir === 'desc'
      ? list.sort((a, b) => (b.probabilidadCategoria || 0) - (a.probabilidadCategoria || 0))
      : list.sort((a, b) => (a.probabilidadCategoria || 0) - (b.probabilidadCategoria || 0));
  }, [docs, search, cat, sortDir]);

  const handleDelete = async (doc: DocumentResponse) => {
    if (!window.confirm(`¿Eliminar "${doc.title}"?`)) return;
    setDeleting(doc.docId);
    try {
      await documentService.deleteByTitle(doc.title);
      setDocs(prev => prev.filter(d => d.docId !== doc.docId));
      if (detailDoc?.docId === doc.docId) setDetailDoc(null);
    } catch {
      alert('Error al eliminar el documento.');
    } finally {
      setDeleting(null);
    }
  };

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
      <div className={`history-table-wrap fade-up${settings.preferences.compactView ? ' compact' : ''}`}>
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
                <th>Idioma</th>
                <th>Nivel</th>
                <th>Precisión</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="table-empty-row">
                  <td colSpan={7}>
                    {docs.length === 0
                      ? 'No hay documentos aún — analiza tu primer contenido'
                      : 'No se encontraron resultados'}
                  </td>
                </tr>
              ) : filtered.map((doc, i) => {
                const col = CATEGORY_COLORS[doc.categoria] ?? THEME.primary;
                const pct = Math.round(doc.probabilidadCategoria * 100);
                const isActive = detailDoc?.docId === doc.docId;
                return (
                  <tr
                    key={doc.docId}
                    style={{ animationDelay: `${i * 0.035}s`, cursor: 'pointer',
                      background: isActive ? 'var(--clr-primary-alpha, rgba(37,99,235,0.08))' : undefined }}
                    onClick={() => handleRowClick(doc)}
                  >
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
                    <td>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(doc); }}
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
      {/* ── Detail Drawer ── */}
      {detailDoc && (
        <div
          ref={drawerRef}
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 340,
            background: 'var(--clr-surface-elevated, var(--clr-surface))',
            borderLeft: '1px solid var(--clr-border)',
            padding: '28px 24px',
            overflowY: 'auto',
            zIndex: 200,
            boxShadow: '-4px 0 32px rgba(0,0,0,0.25)',
            animation: 'slideInRight 0.22s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} style={{ color: 'var(--clr-primary)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Detalle del documento</span>
            </div>
            <button
              onClick={() => setDetailDoc(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)', display: 'flex' }}
            >
              <X size={16} />
            </button>
          </div>

          {detailLoading ? (
            <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>Cargando detalle…</div>
          ) : (
            <>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>
                {detailDoc.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--clr-text-muted)' }}>Categoría</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
                    color: CATEGORY_COLORS[detailDoc.categoria] ?? THEME.primary }}>
                    <CategoryIcon category={detailDoc.categoria} size={13} />
                    {detailDoc.categoria}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--clr-text-muted)' }}>Nivel</span>
                  <span style={{ fontWeight: 600 }}>{detailDoc.nivel ?? '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--clr-text-muted)' }}>Precisión IA</span>
                  <span style={{ fontWeight: 600, color: CATEGORY_COLORS[detailDoc.categoria] ?? THEME.primary }}>
                    {Math.round(detailDoc.probabilidadCategoria * 100)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--clr-text-muted)' }}>ID</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{detailDoc.docId}</span>
                </div>
              </div>

              {detailDoc.keywords?.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginBottom: 8 }}>Keywords</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {detailDoc.keywords.map(kw => (
                      <span key={kw} style={{
                        fontSize: '0.72rem',
                        background: 'var(--clr-surface)',
                        border: '1px solid var(--clr-border)',
                        borderRadius: 6,
                        padding: '3px 8px',
                        color: 'var(--clr-text-muted)',
                      }}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {detailDoc.content && (
                <div style={{ marginTop: 18 }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginBottom: 6 }}>Vista previa</p>
                  <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--clr-text)', opacity: 0.8 }}>
                    {detailDoc.content.slice(0, 300)}{detailDoc.content.length > 300 ? '…' : ''}
                  </p>
                </div>
              )}

              {/* Recomendaciones Semánticas */}
              <div style={{ marginTop: 24, borderTop: '1px solid var(--clr-border)', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Sparkles size={14} style={{ color: 'var(--clr-primary)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Contenido Relacionado</span>
                </div>
                
                {recsLoading ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>Analizando similitudes…</div>
                ) : recommendations.length === 0 ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>No se encontraron documentos similares.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recommendations.map(rec => (
                      <div key={rec.doc_id} style={{ 
                        background: 'var(--clr-surface)', 
                        border: '1px solid var(--clr-border)', 
                        borderRadius: 8, padding: 12 
                      }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                          {rec.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{rec.source_type}</span>
                          <span style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>
                            {Math.round(rec.similarity_score * 100)}% similitud
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDelete(detailDoc)}
                disabled={deleting === detailDoc.docId}
                style={{
                  marginTop: 24, width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  color: 'var(--clr-danger)', borderRadius: 8, padding: '9px 0',
                  cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600,
                  transition: 'background 0.2s',
                }}
              >
                <Trash2 size={13} />
                {deleting === detailDoc.docId ? 'Eliminando…' : 'Eliminar documento'}
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
