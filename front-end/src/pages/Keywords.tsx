import { useState, useEffect, useRef } from 'react';
import { BarChart2, Hash, RefreshCw, Trash2 } from 'lucide-react';
import { keywordService } from '@/services/api';
import type { KeywordResponse } from '@/types';
import './HistoryKeywords.css';

const PALETTE = [
  '#6366f1','#a855f7','#06b6d4','#10b981',
  '#f59e0b','#3b82f6','#ec4899','#14b8a6',
  '#f97316','#8b5cf6','#ef4444','#22c55e',
  '#e11d48','#0ea5e9','#84cc16',
];

function KwBarRow({
  kw, idx, maxFreq, onDelete,
}: {
  kw: KeywordResponse;
  idx: number;
  maxFreq: number;
  onDelete: (kw: KeywordResponse) => void;
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const color = PALETTE[idx % PALETTE.length];
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

  const handleDelete = async (kw: KeywordResponse) => {
    if (!window.confirm(`¿Eliminar la keyword "${kw.keyword}"?`)) return;
    try {
      await keywordService.deleteById(kw.id);
      setKeywords(prev => prev.filter(k => k.id !== kw.id));
    } catch {
      alert('Error al eliminar la keyword.');
    }
  };

  const filtered = keywords.filter(k =>
    !search.trim() || k.keyword.toLowerCase().includes(search.toLowerCase())
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
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px',
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.78rem', color: 'var(--clr-success)',
          marginBottom: 20, animation: 'fade-in 0.4s ease both',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--clr-success)', display: 'inline-block' }} />
          {keywords.length} keywords cargadas desde el backend
          <button onClick={loadKeywords} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--clr-success)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}>
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
            Analiza documentos en la página <a href="/analyze" style={{ color: 'var(--clr-primary-light)' }}>Analizar</a> para generar keywords automáticamente.
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
                <div className="kw-bars-sub">{filtered.length} keywords en el corpus</div>
              </div>
            </div>

            <div className="kw-cloud-body stagger">
              {filtered.map((kw, i) => {
                const ratio  = 1 - (i / (filtered.length || 1));
                const size   = 0.72 + ratio * 0.65;
                const color  = PALETTE[i % PALETTE.length];
                return (
                  <span
                    key={kw.id}
                    className="kw-cloud-chip"
                    style={{
                      fontSize: `${size}rem`,
                      background: `${color}16`,
                      borderColor: `${color}32`,
                      color,
                      animationDelay: `${i * 0.05}s`,
                      cursor: 'default',
                    }}
                    title={`ID: ${kw.id}`}
                  >
                    {kw.keyword}
                  </span>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </main>
  );
}
