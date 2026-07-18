import { useState, useMemo, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/utils/constants';
import { mockRecentActivity } from '@/utils/mockData';
import type { RecentActivity } from '@/types';
import './HistoryKeywords.css';

const ALL_CATS = ['Todas', ...Array.from(new Set(mockRecentActivity.map(a => a.categoria)))];

/* Extend with more mock rows */
const FULL_HISTORY: RecentActivity[] = [
  ...mockRecentActivity,
  {
    id: '7',
    titulo: 'Diseño de Microservicios con Spring Cloud',
    categoria: 'Backend',
    probabilidad: 0.92,
    timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
  },
  {
    id: '8',
    titulo: 'Observabilidad con Prometheus y Grafana',
    categoria: 'DevOps',
    probabilidad: 0.86,
    timestamp: new Date(Date.now() - 1000 * 60 * 260).toISOString(),
  },
  {
    id: '9',
    titulo: 'Introducción a Apache Kafka',
    categoria: 'Backend',
    probabilidad: 0.84,
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
  },
  {
    id: '10',
    titulo: 'Técnicas de Feature Engineering',
    categoria: 'Data Science',
    probabilidad: 0.91,
    timestamp: new Date(Date.now() - 1000 * 60 * 380).toISOString(),
  },
  {
    id: '11',
    titulo: 'Patrones de Diseño en Java',
    categoria: 'Backend',
    probabilidad: 0.88,
    timestamp: new Date(Date.now() - 1000 * 60 * 440).toISOString(),
  },
  {
    id: '12',
    titulo: 'Vue.js 3 Composition API',
    categoria: 'Frontend',
    probabilidad: 0.90,
    timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
  },
];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export function History() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todas');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const filtered = useMemo(() => {
    let list = [...FULL_HISTORY];
    if (cat !== 'Todas') list = list.filter(a => a.categoria === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => a.titulo.toLowerCase().includes(q) || a.categoria.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return sortDir === 'desc' ? diff : -diff;
    });
    return list;
  }, [search, cat, sortDir]);

  return (
    <main className="page-container">
      <header className="page-header">
        <h1 className="page-title">Historial de Análisis</h1>
        <p className="page-description">Todos los contenidos técnicos procesados por el modelo</p>
      </header>

      <div className="history-filters">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            id="history-search"
            type="text"
            className="input"
            placeholder="Buscar por título o categoría…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          id="history-cat-filter"
          className="filter-select"
          value={cat}
          onChange={e => setCat(e.target.value)}
        >
          {ALL_CATS.map(c => <option key={c}>{c}</option>)}
        </select>

        <button
          id="history-sort-btn"
          className="btn btn-ghost btn-sm"
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
        >
          <Filter size={13} />
          {sortDir === 'desc' ? 'Más recientes' : 'Más antiguos'}
        </button>

        <span className="history-count">{filtered.length} resultados</span>
      </div>

      <div className="table-wrap">
        <table>
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
              <tr>
                <td colSpan={5} className="table-empty">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              filtered.map((item, i) => {
                const col = CATEGORY_COLORS[item.categoria] ?? '#6366f1';
                const pct = Math.round(item.probabilidad * 100);
                return (
                  <tr key={item.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <td style={{ color: 'var(--clr-text-muted)', fontWeight: 700 }}>{i + 1}</td>
                    <td className="td-titulo">{item.titulo}</td>
                    <td>
                      <span
                        className="td-cat-badge"
                        style={{ background: `${col}15`, color: col, border: `1px solid ${col}25` }}
                      >
                        {CATEGORY_ICONS[item.categoria] ?? '📄'} {item.categoria}
                      </span>
                    </td>
                    <td>
                      <div className="td-prob">
                        <div className="mini-bar-wrap">
                          <div
                            className="mini-bar"
                            style={{ width: `${pct}%`, background: col }}
                          />
                        </div>
                        <span className="td-prob-val">{pct}%</span>
                      </div>
                    </td>
                    <td>{formatDate(item.timestamp)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
