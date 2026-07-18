import { useState, useEffect, useRef } from 'react';
import { BarChart2, Cloud } from 'lucide-react';
import { mockKeywords } from '@/utils/mockData';
import './HistoryKeywords.css';

const PALETTE = [
  '#6366f1', '#a855f7', '#06b6d4', '#10b981',
  '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6',
  '#f97316', '#8b5cf6', '#ef4444', '#22c55e',
];

function KwBar({ kw, idx, maxFreq }: { kw: { keyword: string; frecuencia: number }; idx: number; maxFreq: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const color = PALETTE[idx % PALETTE.length];
  const pct = (kw.frecuencia / maxFreq) * 100;

  useEffect(() => {
    const t = setTimeout(() => {
      if (barRef.current) barRef.current.style.width = `${pct}%`;
    }, 200 + idx * 60);
    return () => clearTimeout(t);
  }, [pct, idx]);

  return (
    <div className="kw-row" style={{ animationDelay: `${idx * 0.05}s` }}>
      <span className="kw-rank">{idx + 1}</span>
      <span className="kw-name">{kw.keyword}</span>
      <div className="kw-bar-wrap">
        <div
          ref={barRef}
          className="kw-bar"
          style={{ background: color, width: '0%' }}
        />
      </div>
      <span className="kw-count">{kw.frecuencia}</span>
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
          Las palabras clave más frecuentes extraídas del corpus de contenido técnico
        </p>
      </header>

      <div className="keywords-page-grid">
        {/* Bar list */}
        <div className="kw-bar-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={18} style={{ color: 'var(--clr-primary)' }} />
            <div>
              <div className="chart-title">Top {mockKeywords.length} Keywords</div>
              <div className="chart-subtitle">Por frecuencia de aparición en el corpus</div>
            </div>
          </div>
          <div className="kw-list stagger">
            {mockKeywords.map((kw, i) => (
              <KwBar key={kw.keyword} kw={kw} idx={i} maxFreq={maxFreq} />
            ))}
          </div>
        </div>

        {/* Cloud */}
        <div className="kw-cloud-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
            <Cloud size={18} style={{ color: 'var(--clr-secondary)' }} />
            <div>
              <div className="chart-title">Nube de Palabras</div>
              <div className="chart-subtitle">Tamaño proporcional a frecuencia</div>
            </div>
          </div>
          <div className="kw-cloud-wrap stagger" style={{ position: 'relative', zIndex: 1 }}>
            {mockKeywords.map((kw, i) => {
              const ratio = kw.frecuencia / maxFreq;
              const size = 0.72 + ratio * 0.65;
              const color = PALETTE[i % PALETTE.length];
              return (
                <span
                  key={kw.keyword}
                  className="kw-cloud-tag"
                  style={{
                    fontSize: `${size}rem`,
                    background: `${color}15`,
                    borderColor: `${color}30`,
                    color: color,
                    animationDelay: `${i * 0.06}s`,
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
