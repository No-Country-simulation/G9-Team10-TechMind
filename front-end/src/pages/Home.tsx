import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, Brain, Cpu, TrendingUp, Zap, Database, Code2, FileText, Star, Key, Folder } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { CATEGORY_COLORS, THEME, ROUTES } from '@/utils/constants';
import { documentService, keywordService } from '@/services/api';
import type { DocumentResponse, KeywordResponse } from '@/types';
import './Home.css';

function docToCard(doc: DocumentResponse) {
  return {
    id: doc.docId,
    title: doc.title,
    description: doc.content?.slice(0, 120) + (doc.content?.length > 120 ? '…' : ''),
    category: doc.categoria,
    tags: doc.keywords?.slice(0, 2) ?? [],
    similarity: Math.round(doc.probabilidadCategoria * 100),
  };
}

const floatingIcons = [Brain, Cpu, TrendingUp, Zap, Database, Code2, FileText, Star];

function buildDonutArcs(cats: { label: string; color: string; count: number }[], total: number) {
  const top3 = cats.slice(0, 3);
  const circumference = 2 * Math.PI * 38;
  let offset = -10;
  return top3.map(cat => {
    const pct = total > 0 ? cat.count / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const arc = { color: cat.color, dash, gap, offset, label: cat.label, pct: Math.round(pct * 100) };
    offset -= dash;
    return arc;
  });
}

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<ReturnType<typeof docToCard>[]>([]);
  const [recommendations, setRecommendations] = useState<(ReturnType<typeof docToCard> & { recommended: boolean })[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<{ id: string; label: string; color: string; count: number }[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [catFilter, setCatFilter] = useState('');
  const [topKeywords, setTopKeywords] = useState<string[]>([]);

  useEffect(() => {
    documentService.getAll()
      .then(docs => {
        if (docs.length > 0) {
          setTotalDocs(docs.length);
          setRecent(docs.slice(0, 4).map(docToCard));
          const top = [...docs]
            .sort((a, b) => b.probabilidadCategoria - a.probabilidadCategoria)
            .slice(0, 3)
            .map(d => ({ ...docToCard(d), recommended: true }));
          setRecommendations(top);

          const map: Record<string, number> = {};
          docs.forEach(d => { if (d.categoria) map[d.categoria] = (map[d.categoria] || 0) + 1; });
          const cats = Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .map(([id, count]) => ({ id, label: id, color: CATEGORY_COLORS[id] ?? THEME.primary, count }));
          setCategoryCounts(cats);
        }
      })
      .catch(() => {});

    keywordService.getAll()
      .then((kws: KeywordResponse[]) => {
        const freq: Record<string, number> = {};
        kws.forEach(k => {
          const word = k.keyword?.toLowerCase()?.trim();
          if (word) freq[word] = (freq[word] || 0) + 1;
        });
        const sorted = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([w]) => w);
        setTopKeywords(sorted);
      })
      .catch(() => setTopKeywords([]));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
  };

  const filteredCategories = categoryCounts.filter(c =>
    c.label.toLowerCase().includes(catFilter.toLowerCase())
  );

  const donutArcs = buildDonutArcs(categoryCounts, totalDocs);

  return (
    <div className="home-wrapper">

      {/* ── Panel lateral izquierdo: Categorías y estadísticas ── */}
      <aside className="home-side home-side-left">
        <div className="side-stat-card">
          <div className="side-stat-icon" style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
            <FileText size={20} />
          </div>
          <div>
            <div className="side-stat-num">{totalDocs}</div>
            <div className="side-stat-label">Documentos</div>
          </div>
        </div>

        <div className="side-stat-card">
          <div className="side-stat-icon" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}>
            <Brain size={20} />
          </div>
          <div>
            <div className="side-stat-num">{categoryCounts.length}</div>
            <div className="side-stat-label">Categorías</div>
          </div>
        </div>

        {/* Sección de Categorías en el lateral */}
        <div className="side-section-header">
          <span className="side-section-title">
            <Folder size={12} style={{ display: 'inline', marginRight: 4 }} />
            Categorías ({categoryCounts.length})
          </span>
        </div>

        {categoryCounts.length > 8 && (
          <div className="side-cat-search">
            <input
              type="text"
              placeholder="Filtrar categorías..."
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
            />
          </div>
        )}

        <div className="side-cats side-cats-scroll">
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              className="side-cat-item"
              onClick={() => navigate(`${ROUTES.SEARCH}?cat=${encodeURIComponent(cat.id)}`)}
            >
              <span className="side-cat-dot" style={{ background: cat.color }} />
              <span className="side-cat-name">{cat.label}</span>
              <span className="side-cat-count">{cat.count}</span>
            </button>
          ))}
          {filteredCategories.length === 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', padding: '8px 4px' }}>
              {categoryCounts.length === 0 ? 'Cargando...' : 'Sin coincidencias'}
            </p>
          )}
        </div>

        {/* Keywords reales del backend */}
        {topKeywords.length > 0 && (
          <>
            <div className="side-section-title" style={{ marginTop: 14 }}>
              <Key size={11} style={{ display: 'inline', marginRight: 4 }} />
              Keywords populares
            </div>
            <div className="side-keywords">
              {topKeywords.map(kw => (
                <button key={kw} className="side-kw-tag" onClick={() => navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(kw)}`)}>
                  #{kw}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="side-gradient-fill" />
      </aside>

      {/* ── Contenido central limpio y despejado ── */}
      <main className="home-page">
        <section className="home-hero fade-up">
          <h1 className="home-title">Bienvenido a TechMind</h1>
          <p className="home-subtitle">Organiza, analiza y explora tu corpus de conocimiento técnico.</p>
          <form className="home-search" onSubmit={handleSearch}>
            <Search size={18} className="home-search-icon" />
            <input
              type="text"
              placeholder="Buscar documentos, keywords o categorías…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary home-search-btn">Buscar</button>
          </form>
        </section>

        {/* Documentos recientes y Recomendaciones */}
        <div className="home-columns">
          <section className="home-section fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="section-header">
              <h2 className="section-title">Documentos recientes</h2>
              <Link to={ROUTES.LIBRARY} className="section-link">Ver todos <ArrowRight size={14} /></Link>
            </div>
            <div className="doc-list">
              {recent.map((doc, i) => <DocumentCard key={i} {...doc} to={ROUTES.LIBRARY} />)}
            </div>
          </section>

          <section className="home-section fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="section-header">
              <h2 className="section-title">Recomendaciones para ti</h2>
              <Link to={ROUTES.RECOMMENDATIONS} className="section-link">Ver más <ArrowRight size={14} /></Link>
            </div>
            <div className="doc-list">
              {recommendations.map((doc, i) => <DocumentCard key={i} {...doc} recommended to={ROUTES.RECOMMENDATIONS} />)}
            </div>
          </section>
        </div>
      </main>

      {/* ── Panel lateral derecho ── */}
      <aside className="home-side home-side-right">
        <div className="side-section-title">Distribución por Categoría</div>
        <div className="side-donut-container">
          {totalDocs > 0 ? (
            <>
              <svg viewBox="0 0 100 100" className="side-donut-svg">
                <circle cx="50" cy="50" r="38" fill="none" stroke="var(--clr-border)" strokeWidth="10" />
                {donutArcs.map((arc, i) => (
                  <circle key={i}
                    cx="50" cy="50" r="38" fill="none"
                    stroke={arc.color} strokeWidth="10"
                    strokeDasharray={`${arc.dash} ${arc.gap}`}
                    strokeDashoffset={arc.offset}
                    strokeLinecap="round"
                  />
                ))}
                <text x="50" y="46" textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--clr-text-bright)">{totalDocs}</text>
                <text x="50" y="57" textAnchor="middle" fontSize="6.5" fill="var(--clr-text-muted)">documentos</text>
              </svg>
              <div className="side-donut-legend">
                {donutArcs.map((arc, i) => (
                  <div key={i} className="side-legend-item">
                    <span style={{ background: arc.color }} />
                    <span style={{ flex: 1 }}>{arc.label}</span>
                    <strong style={{ fontSize: '0.7rem', color: 'var(--clr-text-bright)' }}>{arc.pct}%</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Sin datos aún
            </p>
          )}
        </div>

        {topKeywords.length > 0 && (
          <>
            <div className="side-section-title" style={{ marginTop: 12 }}>Tendencias de Keywords</div>
            <div className="side-trends">
              {topKeywords.slice(0, 5).map((kw, i) => (
                <div key={kw} className="side-trend-item">
                  <span className="side-trend-rank">#{i + 1}</span>
                  <span className="side-trend-kw">{kw}</span>
                  <div className="side-trend-bar">
                    <div className="side-trend-fill" style={{ width: `${100 - i * 15}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="side-floating-icons" style={{ marginTop: 'auto', paddingTop: 16 }}>
          {floatingIcons.slice(4).map((Icon, i) => (
            <div key={i} className="side-float-icon" style={{ animationDelay: `${i * 0.5}s` }}>
              <Icon size={16} />
            </div>
          ))}
        </div>

        <div className="side-gradient-fill" />
      </aside>
    </div>
  );
}
