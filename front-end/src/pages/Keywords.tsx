import { useState, useEffect, useRef } from 'react';
import { BarChart2, Hash } from 'lucide-react';
import { mockKeywords } from '@/utils/mockData';
import './HistoryKeywords.css';

const PALETTE = [
  '#6366f1','#a855f7','#06b6d4','#10b981',
  '#f59e0b','#3b82f6','#ec4899','#14b8a6',
  '#f97316','#8b5cf6','#ef4444','#22c55e',
  '#e11d48','#0ea5e9','#84cc16',
];

function KwBarRow({
  kw, idx, maxFreq,
}: {
  kw: { keyword: string; frecuencia: number };
  idx: number;
  maxFreq: number;
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const color = PALETTE[idx % PALETTE.length];
  const pct   = (kw.frecuencia / maxFreq) * 100;

  useEffect(() => {
    const id = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = `${pct}%`;
    }, 120 + idx * 55);
    return () => clearTimeout(id);
  }, [pct, idx]);

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

      <span className="kw-bar-count">{kw.frecuencia}</span>
    </div>
  );
}

export function Keywords() {
  const maxFreq = mockKeywords[0].frecuencia;

  return (
    <main className="page-container">
      <header className="page-header">
        <h1 className="page-title">Análisis de Keywords</h1>
        <p className="page-description">
          Palabras clave más frecuentes extraídas del corpus de contenido técnico
        </p>
      </header>

      <div className="kw-page-grid">

        {/* ── Bars card ── */}
        <div className="kw-bars-card fade-up">
          <div className="kw-bars-header">
            <BarChart2 size={18} style={{ color: 'var(--clr-primary)', flexShrink: 0 }} />
            <div>
              <div className="kw-bars-title">Top {mockKeywords.length} Keywords</div>
              <div className="kw-bars-sub">Por frecuencia de aparición en el corpus</div>
            </div>
          </div>

          <div className="kw-bars-list stagger">
            {mockKeywords.map((kw, i) => (
              <KwBarRow key={kw.keyword} kw={kw} idx={i} maxFreq={maxFreq} />
            ))}
          </div>
        </div>

        {/* ── Cloud card ── */}
        <div className="kw-cloud-card fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="kw-cloud-header">
            <Hash size={18} style={{ color: 'var(--clr-secondary)', flexShrink: 0 }} />
            <div>
              <div className="kw-bars-title">Nube de Palabras</div>
              <div className="kw-bars-sub">Tamaño proporcional a frecuencia</div>
            </div>
          </div>

          <div className="kw-cloud-body stagger">
            {mockKeywords.map((kw, i) => {
              const ratio = kw.frecuencia / maxFreq;
              const size  = 0.75 + ratio * 0.65;
              const color = PALETTE[i % PALETTE.length];
              return (
                <span
                  key={kw.keyword}
                  className="kw-cloud-chip"
                  style={{
                    fontSize: `${size}rem`,
                    background: `${color}16`,
                    borderColor: `${color}32`,
                    color,
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  {kw.keyword}
                </span>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}
