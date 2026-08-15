import { useState, useEffect, useRef } from 'react';
import { BarChart2, Hash, BookOpen, X, FileText, Tag } from 'lucide-react';
import { keywordService, documentService } from '@/services/api';
import type { KeywordResponse, DocumentResponse } from '@/types';
import './HistoryKeywords.css';

import { CHART_PALETTE } from '@/utils/constants';

function KwBarRow({
  kw, idx,
}: {
  kw: KeywordResponse;
  idx: number;
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const color = CHART_PALETTE[idx % CHART_PALETTE.length];

  useEffect(() => {
    const id = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = `${100 - idx * 5 > 10 ? 100 - idx * 5 : 10}%`;
    }, 120 + idx * 55);
    return () => clearTimeout(id);
  }, [idx]);

  return (
    <div className="kw-bar-row" style={{ animationDelay: `${idx * 0.045}s` }}>
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

      <span className="kw-bar-count" style={{ color }}>#{kw.id}</span>
    </div>
  );
}

export function Keywords() {
  const [keywords, setKeywords] = useState<KeywordResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selectedKw, setSelectedKw] = useState<KeywordResponse | null>(null);
  const [kwDocs, setKwDocs] = useState<DocumentResponse[]>([]);
  const [kwDocsLoading, setKwDocsLoading] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;


  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const loadKeywords = async () => {
    setLoading(true);
    try {
      const data = await keywordService.getAll();
      setKeywords(data);
    } catch {
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadKeywords(); }, []);

  // Al hacer click en una keyword: busca su detalle y los docs asociados
  const handleKwClick = async (kw: KeywordResponse) => {
    if (selectedKw?.id === kw.id) { setSelectedKw(null); setKwDocs([]); return; }
    setSelectedKw(kw);
    setKwDocs([]);
    setKwDocsLoading(true);
    try {
      // 1️⃣ Obtiene detalle de la keyword por ID
      const detail = await keywordService.getById(kw.id);
      setSelectedKw(detail);
      // 2️⃣ Busca documentos que tienen esta keyword como título-keyword
      const docs = await documentService.getByKeyword(detail.keyword);
      setKwDocs(docs);
    } catch {
      // Si falla, busca por keyword exacta como fallback
      try {
        const kwDetail = await keywordService.getByKeyword(kw.keyword);
        setSelectedKw(kwDetail);
      } catch { /* mantener el objeto básico */ }
    } finally {
      setKwDocsLoading(false);
    }
  };



  const filtered = keywords.filter(k =>
    !search.trim() || k.keyword?.toLowerCase().includes(search.toLowerCase())
  );

  const letterFiltered = filtered
    .filter(k => selectedLetter && k.keyword && k.keyword.toUpperCase().startsWith(selectedLetter));

  const totalPages = Math.ceil(letterFiltered.length / ITEMS_PER_PAGE);
  const cloudKeywords = letterFiltered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <main className="page-container">
      <header className="page-header">
        <h1 className="page-title">Análisis de Keywords</h1>
        <p className="page-description">
          Palabras clave extraídas del corpus de contenido técnico
        </p>
      </header>



      {/* Search bar */}
      {!loading && keywords.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          marginBottom: 24,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--clr-text-muted)' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Filtrar keywords…"
            value={search}
            onChange={e => setSearch(e.target.value)}
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
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
          Cargando keywords…
        </div>
      ) : keywords.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏷️</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6, color: 'var(--clr-text)' }}>
            Sin keywords aún
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            Analiza documentos en la página <a href="/analyze" style={{ color: 'var(--clr-primary)' }}>Analizar</a> para generar keywords automáticamente.
          </p>
        </div>
      ) : (
        <div className="kw-page-grid">

          {/* ── Bars card ── */}
          <div className="kw-bars-card fade-up">
            <div className="kw-bars-header">
              <BarChart2 size={18} style={{ color: 'var(--clr-primary)', flexShrink: 0 }} />
              <div>
                <div className="kw-bars-title">Top {Math.min(filtered.length, 30)} Keywords</div>
                <div className="kw-bars-sub">Listado completo del corpus</div>
              </div>
            </div>

            <div className="kw-bars-list stagger">
              {filtered.slice(0, 30).map((kw, i) => (
                <KwBarRow
                  key={kw.id}
                  kw={kw}
                  idx={i}
                />
              ))}
            </div>
          </div>

          {/* ── Cloud card ── */}
          <div className="kw-cloud-card fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="kw-cloud-header">
              <Hash size={18} style={{ color: 'var(--clr-secondary)', flexShrink: 0 }} />
              <div>
                <div className="kw-bars-title">Nube de Palabras</div>
                <div className="kw-bars-sub">{cloudKeywords.length} keywords {selectedLetter ? `con la letra ${selectedLetter}` : 'en total'}</div>
              </div>
            </div>

            {/* Abecedario */}
            <div className="kw-alpha-filter fade-up">
              {ALPHABET.map(letter => (
                <button
                  key={letter}
                  className={`kw-alpha-btn ${selectedLetter === letter ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedLetter(letter);
                    setCurrentPage(1); // Reset page on letter change
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>

            <div className="kw-cloud-body stagger">
              {!selectedLetter ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', width: '100%', color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
                  Selecciona una letra del abecedario para explorar las palabras clave.
                </div>
              ) : cloudKeywords.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', width: '100%', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                  No hay palabras clave con esta letra.
                </div>
              ) : cloudKeywords.map((kw, i) => {
                const ratio  = 1 - (i / (cloudKeywords.length || 1));
                const size   = 0.72 + ratio * 0.65;
                const color  = CHART_PALETTE[i % CHART_PALETTE.length];
                const isActive = selectedKw?.id === kw.id;
                return (
                  <span
                    key={kw.id}
                    className="kw-cloud-chip"
                    style={{
                      fontSize: `${size}rem`,
                      background: isActive ? `${color}30` : `${color}16`,
                      borderColor: isActive ? color : `${color}32`,
                      color,
                      animationDelay: `${Math.min(i, 20) * 0.04}s`,
                      cursor: 'pointer',
                      outline: isActive ? `2px solid ${color}` : 'none',
                      outlineOffset: 2,
                      transition: 'all 0.15s',
                    }}
                    title={`ID: ${kw.id} — Click para ver documentos`}
                    onClick={() => handleKwClick(kw)}
                  >
                    {kw.keyword}
                  </span>
                );
              })}
            </div>

            {/* Paginación Numérica */}
            {selectedLetter && totalPages > 1 && (
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

      {/* ── Modal central: detalle de keyword y documentos ── */}
      {selectedKw && (
        <div
          className="doc-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) { setSelectedKw(null); setKwDocs([]); } }}
          style={{ zIndex: selectedDoc ? 490 : 500 }}
        >
          <div className="doc-modal" style={{ maxWidth: 540 }}>
            {/* Header */}
            <div className="doc-modal-header">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
                <div className="doc-modal-icon">
                  <Hash size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 className="doc-modal-title">{selectedKw.keyword}</h2>
                  <div className="doc-modal-meta">
                    <span className="doc-modal-conf">ID: #{selectedKw.id}</span>
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
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text)', marginBottom: 12 }}>
                  <BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--clr-primary)' }} />
                  Documentos con esta keyword
                </p>
                {kwDocsLoading ? (
                  <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>Buscando documentos…</div>
                ) : kwDocs.length === 0 ? (
                  <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>Ningún documento asociado</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {kwDocs.map(doc => (
                      <button
                        key={doc.docId}
                        onClick={() => setSelectedDoc(doc)}
                        className="kw-doc-card-btn"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <FileText size={12} style={{ color: 'var(--clr-primary)', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--clr-text)', textAlign: 'left', lineHeight: 1.3 }}>{doc.title}</span>
                        </div>
                        <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.72rem', paddingLeft: 18 }}>
                          {doc.categoria} · {Math.round((doc.probabilidadCategoria || 0) * 100)}%
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--clr-primary)', paddingLeft: 18, marginTop: 2, opacity: 0.7 }}>Ver documento completo →</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      )}

      {/* ── Modal central: contenido completo del documento ── */}
      {selectedDoc && (
        <div
          className="doc-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedDoc(null); }}
        >
          <div className="doc-modal">
            {/* Header */}
            <div className="doc-modal-header">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
                <div className="doc-modal-icon">
                  <FileText size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 className="doc-modal-title">{selectedDoc.title}</h2>
                  <div className="doc-modal-meta">
                    <span className="doc-modal-cat">{selectedDoc.categoria}</span>
                    <span className="doc-modal-conf">{Math.round((selectedDoc.probabilidadCategoria || 0) * 100)}% confianza</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="doc-modal-close"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Keywords */}
            {selectedDoc.keywords && selectedDoc.keywords.length > 0 && (
              <div className="doc-modal-keywords">
                <Tag size={13} style={{ color: 'var(--clr-secondary)', flexShrink: 0 }} />
                {selectedDoc.keywords.map(kw => (
                  <span key={kw} className="doc-modal-kw-chip">{kw}</span>
                ))}
              </div>
            )}

            {/* Contenido */}
            <div className="doc-modal-body">
              {selectedDoc.content ? (
                <p className="doc-modal-content">{selectedDoc.content}</p>
              ) : (
                <p style={{ color: 'var(--clr-text-muted)', fontStyle: 'italic', fontSize: '0.88rem' }}>Sin contenido disponible.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
