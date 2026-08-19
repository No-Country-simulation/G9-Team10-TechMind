import { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart2, Hash, BookOpen, X, FileText, Sparkles } from 'lucide-react';
import { keywordService, documentService } from '@/services/api';
import { DocumentDetailModal } from '@/components/ui/DocumentDetailModal';
import type { KeywordResponse, DocumentResponse } from '@/types';
import { CHART_PALETTE } from '@/utils/constants';
import './HistoryKeywords.css';

interface KeywordStatItem {
  id: number;
  keyword: string;
  count: number;
  docs: DocumentResponse[];
}

function KwBarRow({
  kw, idx, maxCount, onClick
}: {
  kw: KeywordStatItem;
  idx: number;
  maxCount: number;
  onClick: () => void;
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const color = CHART_PALETTE[idx % CHART_PALETTE.length];
  const targetPct = maxCount > 0 ? Math.max(12, Math.round((kw.count / maxCount) * 100)) : 12;

  useEffect(() => {
    const id = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = `${targetPct}%`;
    }, 80 + idx * 30);
    return () => clearTimeout(id);
  }, [idx, targetPct]);

  return (
    <div
      className="kw-bar-row"
      style={{ animationDelay: `${idx * 0.03}s`, cursor: 'pointer' }}
      onClick={onClick}
      title={`Click para ver ${kw.count} documento(s) con "${kw.keyword}"`}
    >
      <span className="kw-bar-rank">{idx + 1}</span>

      <div className="kw-bar-center">
        <span className="kw-bar-label">{kw.keyword}</span>
        <div className="kw-bar-track">
          <div
            ref={fillRef}
            className="kw-bar-fill"
            style={{ background: color, width: '0%' }}
          />
        </div>
      </div>

      <span className="kw-bar-count" style={{ color, fontWeight: 700, fontSize: '0.78rem' }}>
        {kw.count} {kw.count === 1 ? 'doc' : 'docs'}
      </span>
    </div>
  );
}

export function Keywords() {
  const [allDocs, setAllDocs] = useState<DocumentResponse[]>([]);
  const [keywordStats, setKeywordStats] = useState<KeywordStatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedKw, setSelectedKw] = useState<KeywordStatItem | null>(null);
  const [kwDocs, setKwDocs] = useState<DocumentResponse[]>([]);
  const [kwDocsLoading, setKwDocsLoading] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string>('TODAS');
  const [selectedDoc, setSelectedDoc] = useState<DocumentResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 40;

  const ALPHABET = ['TODAS', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsData, kwsData] = await Promise.allSettled([
        documentService.getAll(),
        keywordService.getAll()
      ]);

      const docs: DocumentResponse[] = docsData.status === 'fulfilled' ? docsData.value : [];
      const kws: KeywordResponse[] = kwsData.status === 'fulfilled' ? kwsData.value : [];
      setAllDocs(docs);

      // Mapa para acumular frecuencia real de keywords en el corpus
      const kwMap: Record<string, { id: number; keyword: string; count: number; docs: DocumentResponse[] }> = {};

      // 1. Contar ocurrencias reales en cada documento
      docs.forEach(doc => {
        if (Array.isArray(doc.keywords)) {
          doc.keywords.forEach(k => {
            const norm = k?.trim();
            if (!norm) return;
            const key = norm.toLowerCase();
            if (!kwMap[key]) {
              kwMap[key] = {
                id: Math.abs(key.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0)) % 10000 + 1,
                keyword: norm,
                count: 0,
                docs: []
              };
            }
            kwMap[key].count += 1;
            if (!kwMap[key].docs.some(d => d.docId === doc.docId)) {
              kwMap[key].docs.push(doc);
            }
          });
        }
      });

      // 2. Incorporar keywords registradas en la BD de backend
      kws.forEach(k => {
        const norm = k.keyword?.trim();
        if (!norm) return;
        const key = norm.toLowerCase();
        if (!kwMap[key]) {
          kwMap[key] = {
            id: k.id,
            keyword: norm,
            count: 0,
            docs: []
          };
        } else {
          kwMap[key].id = k.id;
        }
      });

      // 3. Ordenar por frecuencia real descendente, y luego alfabéticamente
      const sortedStats = Object.values(kwMap).sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.keyword.localeCompare(b.keyword);
      });

      setKeywordStats(sortedStats);
    } catch {
      setKeywordStats([]);
      setAllDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Manejar clic en una keyword para ver sus documentos asociados
  const handleKwClick = async (kw: KeywordStatItem) => {
    setSelectedKw(kw);
    setKwDocs(kw.docs || []);

    // Si no teníamos documentos asociados en memoria, consultar al backend
    if (!kw.docs || kw.docs.length === 0) {
      setKwDocsLoading(true);
      try {
        const docs = await documentService.getByKeyword(kw.keyword);
        setKwDocs(docs);
      } catch {
        // Buscar localmente en allDocs por si la keyword está en keywords o texto
        const localMatches = allDocs.filter(d =>
          d.keywords?.some(k => k.toLowerCase() === kw.keyword.toLowerCase()) ||
          d.title?.toLowerCase().includes(kw.keyword.toLowerCase()) ||
          d.content?.toLowerCase().includes(kw.keyword.toLowerCase())
        );
        setKwDocs(localMatches);
      } finally {
        setKwDocsLoading(false);
      }
    }
  };

  // Filtrado por buscador de texto
  const filtered = useMemo(() => {
    if (!search.trim()) return keywordStats;
    const q = search.toLowerCase();
    return keywordStats.filter(k => k.keyword.toLowerCase().includes(q));
  }, [keywordStats, search]);

  // Filtrado por abecedario
  const letterFiltered = useMemo(() => {
    if (!selectedLetter || selectedLetter === 'TODAS') return filtered;
    return filtered.filter(k => k.keyword.toUpperCase().startsWith(selectedLetter));
  }, [filtered, selectedLetter]);

  const maxCount = useMemo(() => {
    return keywordStats.length > 0 ? Math.max(...keywordStats.map(k => k.count), 1) : 1;
  }, [keywordStats]);

  const totalPages = Math.ceil(letterFiltered.length / ITEMS_PER_PAGE);
  const cloudKeywords = useMemo(() => {
    return letterFiltered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [letterFiltered, currentPage]);

  return (
    <main className="page-container">
      <header className="page-header fade-up">
        <h1 className="page-title">Análisis de Keywords</h1>
        <p className="page-description">
          Frecuencia y distribución real de palabras clave extraídas del corpus por el modelo de IA ({keywordStats.length} palabras clave únicas)
        </p>
      </header>

      {/* Barra de búsqueda */}
      {!loading && keywordStats.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          marginBottom: 24,
        }} className="fade-up">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--clr-text-muted)' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Filtrar por palabra clave…"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--clr-text)', fontSize: '0.875rem', width: '100%',
            }}
          />
          {search && (
            <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--clr-text-muted)' }} className="fade-up">
          <Sparkles size={32} className="spin" style={{ color: 'var(--clr-primary)', marginBottom: 12 }} />
          <div>Analizando frecuencias de palabras clave en la base de datos…</div>
        </div>
      ) : keywordStats.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--clr-text-muted)' }} className="fade-up">
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏷️</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6, color: 'var(--clr-text)' }}>
            Sin keywords aún
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            Analiza documentos en la página <a href="#/analyze" style={{ color: 'var(--clr-primary)' }}>Analizar</a> para extraer y clasificar palabras clave automáticamente.
          </p>
        </div>
      ) : (
        <div className="kw-page-grid">

          {/* ── Tarjeta: Ranking Real por Frecuencia ── */}
          <div className="kw-bars-card fade-up">
            <div className="kw-bars-header">
              <BarChart2 size={18} style={{ color: 'var(--clr-primary)', flexShrink: 0 }} />
              <div>
                <div className="kw-bars-title">Top {Math.min(filtered.length, 30)} Keywords Más Frecuentes</div>
                <div className="kw-bars-sub">Ordenadas por número de documentos asociados en el corpus</div>
              </div>
            </div>

            <div className="kw-bars-list stagger">
              {filtered.slice(0, 30).map((kw, i) => (
                <KwBarRow
                  key={kw.keyword}
                  kw={kw}
                  idx={i}
                  maxCount={maxCount}
                  onClick={() => handleKwClick(kw)}
                />
              ))}
            </div>
          </div>

          {/* ── Tarjeta: Nube de Palabras Interactiva ── */}
          <div className="kw-cloud-card fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="kw-cloud-header">
              <Hash size={18} style={{ color: 'var(--clr-secondary)', flexShrink: 0 }} />
              <div>
                <div className="kw-bars-title">Nube de Palabras Clave</div>
                <div className="kw-bars-sub">
                  {letterFiltered.length} palabras clave {selectedLetter !== 'TODAS' ? `con la letra "${selectedLetter}"` : 'disponibles'}
                </div>
              </div>
            </div>

            {/* Abecedario */}
            <div className="kw-alpha-filter">
              {ALPHABET.map(letter => (
                <button
                  key={letter}
                  className={`kw-alpha-btn ${selectedLetter === letter ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedLetter(letter);
                    setCurrentPage(1);
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>

            <div className="kw-cloud-body stagger">
              {cloudKeywords.length === 0 ? (
                <div style={{ padding: '30px 20px', textAlign: 'center', width: '100%', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                  No se encontraron palabras clave con la letra "{selectedLetter}".
                </div>
              ) : (
                cloudKeywords.map((kw, i) => {
                  const weightRatio = maxCount > 1 ? kw.count / maxCount : 0.5;
                  const fontSizeRem = 0.76 + weightRatio * 0.45;
                  const color = CHART_PALETTE[i % CHART_PALETTE.length];
                  const isActive = selectedKw?.keyword === kw.keyword;

                  return (
                    <span
                      key={kw.keyword}
                      className="kw-cloud-chip"
                      style={{
                        fontSize: `${fontSizeRem}rem`,
                        background: isActive ? `${color}35` : `${color}14`,
                        borderColor: isActive ? color : `${color}30`,
                        color,
                        animationDelay: `${Math.min(i, 25) * 0.02}s`,
                        cursor: 'pointer',
                        outline: isActive ? `2px solid ${color}` : 'none',
                        outlineOffset: 2,
                        transition: 'all 0.15s',
                        fontWeight: kw.count > 1 ? 600 : 500,
                      }}
                      title={`${kw.keyword} — Presente en ${kw.count} documento(s)`}
                      onClick={() => handleKwClick(kw)}
                    >
                      #{kw.keyword}
                      {kw.count > 0 && (
                        <span style={{ opacity: 0.75, fontSize: '0.68rem', marginLeft: 4 }}>
                          ({kw.count})
                        </span>
                      )}
                    </span>
                  );
                })
              )}
            </div>

            {/* Paginación Numérica */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24, paddingBottom: 10 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: 32, height: 32,
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: currentPage === page ? 'var(--clr-primary)' : 'var(--clr-border)',
                      background: currentPage === page ? 'var(--clr-primary)' : 'transparent',
                      color: currentPage === page ? '#fff' : 'var(--clr-text)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── Modal: Detalle de Keyword y Lista de Documentos ── */}
      {selectedKw && (
        <div
          className="doc-modal-overlay fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) { setSelectedKw(null); setKwDocs([]); } }}
        >
          <div className="doc-modal" style={{ maxWidth: 580 }}>
            {/* Header */}
            <div className="doc-modal-header">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
                <div className="doc-modal-icon" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--clr-primary)' }}>
                  <Hash size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 className="doc-modal-title">#{selectedKw.keyword}</h2>
                  <div className="doc-modal-meta">
                    <span className="doc-modal-conf">
                      Presente en {kwDocs.length || selectedKw.count} documento(s) del corpus
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setSelectedKw(null); setKwDocs([]); }}
                className="doc-modal-close"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo principal */}
            <div className="doc-modal-body">
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--clr-text)', marginBottom: 12 }}>
                  <BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--clr-primary)' }} />
                  Documentos asociados a esta palabra clave:
                </p>
                {kwDocsLoading ? (
                  <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem', padding: '16px 0' }}>
                    Consultando documentos asociados…
                  </div>
                ) : kwDocs.length === 0 ? (
                  <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem', padding: '16px 0' }}>
                    No se encontraron documentos asociados a esta palabra clave.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
                    {kwDocs.map(doc => (
                      <button
                        key={doc.docId || doc.title}
                        onClick={() => setSelectedDoc(doc)}
                        className="kw-doc-card-btn"
                        style={{ textAlign: 'left', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <FileText size={13} style={{ color: 'var(--clr-primary)', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--clr-text-bright)', lineHeight: 1.3 }}>
                            {doc.title}
                          </span>
                        </div>
                        <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem', paddingLeft: 19 }}>
                          {doc.categoria || 'General'} · {Math.round((doc.probabilidadCategoria || 0.85) * 100)}% precisión
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--clr-primary)', paddingLeft: 19, marginTop: 4, fontWeight: 500 }}>
                          Ver contenido completo y recomendaciones →
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Visor completo de lectura del documento ── */}
      {selectedDoc && (
        <DocumentDetailModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onSelectDoc={setSelectedDoc}
        />
      )}
    </main>
  );
}
