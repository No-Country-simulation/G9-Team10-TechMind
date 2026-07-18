import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, ChevronDown, Check } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/utils/constants';
import { mockRecentActivity } from '@/utils/mockData';
import type { RecentActivity } from '@/types';
import './HistoryKeywords.css';

/* ── Extended mock data ── */
const FULL_HISTORY: RecentActivity[] = [
  ...mockRecentActivity,
  { id:'7',  titulo:'Diseño de Microservicios con Spring Cloud', categoria:'Backend',       probabilidad:0.92, timestamp: new Date(Date.now()-1000*60*200).toISOString() },
  { id:'8',  titulo:'Observabilidad con Prometheus y Grafana',  categoria:'DevOps',         probabilidad:0.86, timestamp: new Date(Date.now()-1000*60*260).toISOString() },
  { id:'9',  titulo:'Introducción a Apache Kafka',              categoria:'Backend',         probabilidad:0.84, timestamp: new Date(Date.now()-1000*60*320).toISOString() },
  { id:'10', titulo:'Técnicas de Feature Engineering',          categoria:'Data Science',    probabilidad:0.91, timestamp: new Date(Date.now()-1000*60*380).toISOString() },
  { id:'11', titulo:'Patrones de Diseño en Java',               categoria:'Backend',         probabilidad:0.88, timestamp: new Date(Date.now()-1000*60*440).toISOString() },
  { id:'12', titulo:'Vue.js 3 Composition API',                 categoria:'Frontend',        probabilidad:0.90, timestamp: new Date(Date.now()-1000*60*500).toISOString() },
];

const ALL_CATS = ['Todas', ...Array.from(new Set(FULL_HISTORY.map(a => a.categoria))).sort()];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', {
    day:'2-digit', month:'short',
    hour:'2-digit', minute:'2-digit',
  }).format(new Date(iso));
}

/* ── Custom Dropdown ── */
function CatDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
        {color && <span className="dot" style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0 }} />}
        <span className="cat-trigger-label">{value}</span>
        <ChevronDown size={13} className="cat-chevron" />
      </button>

      {open && (
        <div className="cat-menu" role="listbox">
          {ALL_CATS.map(c => {
            const cColor = c !== 'Todas' ? (CATEGORY_COLORS[c] ?? '#6366f1') : undefined;
            return (
              <div
                key={c}
                role="option"
                aria-selected={c === value}
                className={`cat-option${c === value ? ' active' : ''}`}
                onClick={() => { onChange(c); setOpen(false); }}
              >
                {cColor && <span className="dot" style={{ width:7, height:7, borderRadius:'50%', background:cColor, flexShrink:0 }} />}
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
  const [search,  setSearch]  = useState('');
  const [cat,     setCat]     = useState('Todas');
  const [sortDir, setSortDir] = useState<'desc'|'asc'>('desc');

  const filtered = useMemo(() => {
    let list = [...FULL_HISTORY];
    if (cat !== 'Todas') list = list.filter(a => a.categoria === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.titulo.toLowerCase().includes(q) ||
        a.categoria.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      const d = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return sortDir === 'desc' ? d : -d;
    });
  }, [search, cat, sortDir]);

  return (
    <main className="page-container">
      <header className="page-header">
        <h1 className="page-title">Historial de Análisis</h1>
        <p className="page-description">Todos los contenidos técnicos procesados por el modelo</p>
      </header>

      {/* ── Toolbar ── */}
      <div className="history-toolbar">
        <div className="hist-search">
          <Search size={14} className="hist-search-icon" />
          <input
            id="history-search"
            type="text"
            placeholder="Buscar por título o categoría…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <CatDropdown value={cat} onChange={setCat} />

        <button
          id="history-sort-btn"
          className="hist-sort-btn"
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
        >
          <Filter size={13} />
          {sortDir === 'desc' ? 'Más recientes' : 'Más antiguos'}
        </button>

        <span className="hist-count">{filtered.length} resultados</span>
      </div>

      {/* ── Table ── */}
      <div className="history-table-wrap fade-up">
        <table>
          <colgroup>
            <col className="col-num" />
            <col className="col-titulo" />
            <col className="col-cat" />
            <col className="col-conf" />
            <col className="col-fecha" />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Categoría</th>
              <th>Confianza</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className="table-empty-row">
                <td colSpan={5}>No se encontraron resultados</td>
              </tr>
            ) : filtered.map((item, i) => {
              const col = CATEGORY_COLORS[item.categoria] ?? '#6366f1';
              const pct = Math.round(item.probabilidad * 100);
              return (
                <tr key={item.id} style={{ animationDelay: `${i * 0.035}s` }}>
                  <td className="td-num col-num">{i + 1}</td>
                  <td className="td-titulo">{item.titulo}</td>
                  <td>
                    <span
                      className="cat-badge"
                      style={{ background:`${col}14`, color:col, border:`1px solid ${col}28` }}
                    >
                      {CATEGORY_ICONS[item.categoria] ?? '📄'} {item.categoria}
                    </span>
                  </td>
                  <td>
                    <div className="conf-cell">
                      <div className="mini-bar-bg">
                        <div className="mini-bar-fill" style={{ width:`${pct}%`, background:col }} />
                      </div>
                      <span className="conf-val">{pct}%</span>
                    </div>
                  </td>
                  <td style={{ color:'var(--clr-text-muted)' }}>{formatDate(item.timestamp)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
