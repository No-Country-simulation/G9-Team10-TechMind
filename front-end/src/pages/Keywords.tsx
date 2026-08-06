import { useState, useEffect, useRef } from 'react';
import { BarChart2, Hash, RefreshCw, Trash2, BookOpen, X } from 'lucide-react';
import { keywordService, documentService } from '@/services/api';
import type { KeywordResponse, DocumentResponse } from '@/types';
import './HistoryKeywords.css';

import { CHART_PALETTE } from '@/utils/constants';

function KwBarRow({
  kw, idx, maxFreq, onDelete,
}: {
  kw: KeywordResponse;
  idx: number;
  maxFreq: number;
  onDelete: (kw: KeywordResponse) => void;
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const color = CHART_PALETTE[idx % CHART_PALETTE.length];
  const pct   = maxFreq > 0 ? (idx === 0 ? 100 : Math.round(100 - idx * (80 / maxFreq))) : 0;

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

      <button
        onClick={() => onDelete(kw)}
        title="Eliminar keyword"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--clr-danger)',
          cursor: 'pointer',
          padding: '2px 4px',
          borderRadius: 4,
          opacity: 0.5,
          transition: 'opacity 0.2s',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

export function Keywords() {
  const [keywords, setKeywords] = useState<KeywordResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [isDemo,   setIsDemo]   = useState(false);
  const [search,   setSearch]   = useState('');
  const [selectedKw, setSelectedKw] = useState<KeywordResponse | null>(null);
  const [kwDocs, setKwDocs] = useState<DocumentResponse[]>([]);
  const [kwDocsLoading, setKwDocsLoading] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        // Ignorar si se hizo click en un chip de la nube (tienen su propio handler)
        const target = e.target as HTMLElement;
        if (target.closest('.kw-cloud-chip')) return;
        
        setSelectedKw(null);
        setKwDocs([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const loadKeywords = async () => {
    setLoading(true);
    try {
      const data = await keywordService.getAll();
      setKeywords(data);
      setIsDemo(false);
    } catch {
      setIsDemo(true);
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

  const handleDelete = async (kw: KeywordResponse) => {
    if (!window.confirm(`¿Eliminar la keyword "${kw.keyword}"?`)) return;
    try {
      // 1️⃣ Primero intenta deleteByKeyword (más semántico)
      await keywordService.deleteByKeyword(kw.keyword);
      setKeywords(prev => prev.filter(k => k.id !== kw.id));
      if (selectedKw?.id === kw.id) { setSelectedKw(null); setKwDocs([]); }
    } catch {
      // Fallback: deleteById
      try {
        await keywordService.deleteById(kw.id);
        setKeywords(prev => prev.filter(k => k.id !== kw.id));
        if (selectedKw?.id === kw.id) { setSelectedKw(null); setKwDocs([]); }
      } catch {
        alert('Error al eliminar la keyword.');
      }
    }
  };

  const filtered = keywords.filter(k =>
    !search.trim() || k.keyword?.toLowerCase().includes(search.toLowerCase())
  );

  const cloudKeywords = filtered.filter(k => 
    !selectedLetter || (k.keyword && k.keyword.toUpperCase().startsWith(selectedLetter))
  );

  return (
    <main className="page-container">
      <header className="page-header">
        <h1 className="page-title">Análisis de Keywords</h1>
        <p className="page-description">
          Palabras clave extraídas del corpus de contenido técnico
        </p>
      </header>

      {/* Status / demo banner */}
      {isDemo ? (
        <div className="demo-banner" style={{ marginBottom: 20 }}>
          Backend no disponible — no hay keywords reales.
          <button onClick={loadKeywords} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--clr-warning)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={11} /> Reintentar
          </button>
        </div>
      ) : !loading && (
        <div className="status-banner">
          <span className="status-banner-dot" />
          {keywords.length} keywords cargadas desde el backend
          <button onClick={loadKeywords} className="status-banner-btn">
            <RefreshCw size={11} /> Actualizar
          </button>
        </div>
      )}

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
                  maxFreq={filtered.length}
                  onDelete={handleDelete}
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
              <button 
                className={`kw-alpha-btn ${!selectedLetter ? 'active' : ''}`}
                onClick={() => setSelectedLetter(null)}
              >
                Todas
              </button>
              {ALPHABET.map(letter => (
                <button
                  key={letter}
                  className={`kw-alpha-btn ${selectedLetter === letter ? 'active' : ''}`}
                  onClick={() => setSelectedLetter(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>

            <div className="kw-cloud-body stagger">
              {cloudKeywords.length === 0 ? (
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
                      animationDelay: `${i * 0.05}s`,
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
          </div>

        </div>
      )}

      {/* ── Panel lateral: documentos que usan esta keyword ── */}
      {selectedKw && (
        <div
          ref={drawerRef}
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 320,
            background: 'var(--clr-surface-elevated, var(--clr-surface))',
            borderLeft: '1px solid var(--clr-border)',
            padding: '28px 22px',
            overflowY: 'auto',
            zIndex: 200,
            boxShadow: '-4px 0 32px rgba(0,0,0,0.25)',
            animation: 'slideInRight 0.22s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Hash size={15} style={{ color: 'var(--clr-secondary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{selectedKw.keyword}</span>
            </div>
            <button
              onClick={() => { setSelectedKw(null); setKwDocs([]); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)', display: 'flex' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 16 }}>
            ID: <span style={{ fontFamily: 'monospace' }}>#{selectedKw.id}</span>
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginBottom: 10 }}>
              <BookOpen size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Documentos con esta keyword
            </p>
            {kwDocsLoading ? (
              <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>Buscando documentos…</div>
            ) : kwDocs.length === 0 ? (
              <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>Ningún documento asociado</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {kwDocs.map(doc => (
                  <div key={doc.docId} style={{
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{doc.title}</div>
                    <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.72rem' }}>
                      {doc.categoria} · {Math.round(doc.probabilidadCategoria * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleDelete(selectedKw)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              color: 'var(--clr-danger)', borderRadius: 8, padding: '9px 0',
              cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600,
            }}
          >
            <Trash2 size={13} /> Eliminar keyword
          </button>
        </div>
      )}
    </main>
  );
}
