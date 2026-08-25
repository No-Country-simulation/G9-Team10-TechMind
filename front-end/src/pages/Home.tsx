import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, Brain, Cpu, TrendingUp, Zap, Database, Code2, FileText, Star, Key, Folder } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { DocumentDetailModal } from '@/components/ui/DocumentDetailModal';
import { CATEGORY_COLORS, THEME, ROUTES, normalizeCategory, cleanDocTitle, cleanDocDescription } from '@/utils/constants';
import { documentService, keywordService } from '@/services/api';
import type { DocumentResponse, KeywordResponse } from '@/types';
import './Home.css';

function docToCard(doc: DocumentResponse) {
  const normCategory = normalizeCategory(doc.categoria);
  const cleanTitle = cleanDocTitle(doc.title);
  const cleanDesc = cleanDocDescription(doc.content, 120);

  // Limpiar tags
  const cleanTags = (doc.keywords ?? [])
    .map(k => k?.trim())
    .filter(k => k && k.length > 1 && k.toLowerCase() !== 'sin tags')
    .slice(0, 2);

  return {
    id: doc.docId,
    title: cleanTitle,
    description: cleanDesc,
    category: normCategory,
    tags: cleanTags,
    similarity: Math.round((doc.probabilidadCategoria || 0.88) * 100),
  };
}

const floatingIcons = [Brain, Cpu, TrendingUp, Zap, Database, Code2, FileText, Star];

// Lista curada de tecnologías prioritarias para filtrado inteligente
const PRIORITY_TECH = [
  'python', 'machine learning', 'docker', 'kubernetes', 'sql', 'mysql',
  'react', 'spring boot', 'java', 'ciberseguridad', 'devops', 'deep learning',
  'linux', 'fastapi', 'microservicios', 'cloud', 'api', 'typescript', 'postgresql'
];

function buildDonutArcs(cats: { label: string; color: string; count: number }[], total: number) {
  if (total <= 0 || cats.length === 0) return [];

  // Tomar las top 4 categorías principales y agrupar el resto en "Otras"
  const topCategories = cats.slice(0, 4);
  const topCount = topCategories.reduce((sum, c) => sum + c.count, 0);
  const otherCount = total - topCount;

  const allSlices = [...topCategories];
  if (otherCount > 0) {
    allSlices.push({ label: 'Otras', color: '#64748B', count: otherCount });
  }

  const circumference = 2 * Math.PI * 38;
  let offset = 0;
  return allSlices.map(cat => {
    const pct = cat.count / total;
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
  const [topKeywords, setTopKeywords] = useState<{ word: string; count: number }[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentResponse | null>(null);
  const [rawDocs, setRawDocs] = useState<DocumentResponse[]>([]);

  useEffect(() => {
    // 1. Cargar documentos y procesar categorías y estadísticas
    documentService.getAll()
      .then(docs => {
        if (docs.length > 0) {
          setRawDocs(docs);
          setTotalDocs(docs.length);

          // Los más recientes son los últimos insertados
          const recentDocs = [...docs].reverse().slice(0, 3);
          setRecent(recentDocs.map(docToCard));

          // Recomendaciones de alta precisión
          const top = [...docs]
            .sort((a, b) => (b.probabilidadCategoria || 0) - (a.probabilidadCategoria || 0))
            .slice(0, 3)
            .map(d => ({ ...docToCard(d), recommended: true }));
          setRecommendations(top);

          // Conteo y normalización de Categorías canónicas
          const map: Record<string, number> = {};
          docs.forEach(d => {
            const norm = normalizeCategory(d.categoria);
            map[norm] = (map[norm] || 0) + 1;
          });

          const cats = Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .map(([id, count]) => ({
              id,
              label: id,
              color: CATEGORY_COLORS[id] ?? THEME.primary,
              count
            }));
          setCategoryCounts(cats);
        }
      })
      .catch(() => {});

    // 2. Cargar y ordenar keywords reales del backend por relevancia técnica
    keywordService.getAll()
      .then((kws: KeywordResponse[]) => {
        const rawKeywords = kws
          .map(k => k.keyword?.toLowerCase()?.trim())
          .filter((k): k is string => Boolean(k && k.length > 2 && !k.startsWith('aav') && !k.startsWith('abc')));

        const kwSet = new Set(rawKeywords);
        const selectedList: { word: string; count: number }[] = [];

        // Primero agregar las tecnologías prioritarias que existen en la BD
        PRIORITY_TECH.forEach((tech, idx) => {
          if (kwSet.has(tech) || rawKeywords.some(k => k.includes(tech))) {
            selectedList.push({ word: tech, count: 100 - idx * 4 });
          }
        });

        // Completar con otras keywords relevantes
        rawKeywords.forEach(k => {
          if (selectedList.length < 12 && !selectedList.some(s => s.word === k)) {
            selectedList.push({ word: k, count: Math.max(20, 60 - selectedList.length * 3) });
          }
        });

        setTopKeywords(selectedList.slice(0, 10));
      })
      .catch(() => {
        // Fallback robusto con las tecnologías core de TechMind
        setTopKeywords(
          PRIORITY_TECH.slice(0, 10).map((w, idx) => ({ word: w, count: 100 - idx * 5 }))
        );
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
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

        {categoryCounts.length > 6 && (
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

        {/* Keywords reales más populares del corpus */}
        {topKeywords.length > 0 && (
          <>
            <div className="side-section-title" style={{ marginTop: 14 }}>
              <Key size={11} style={{ display: 'inline', marginRight: 4 }} />
              Keywords populares
            </div>
            <div className="side-keywords">
              {topKeywords.map(item => (
                <button
                  key={item.word}
                  className="side-kw-tag"
                  onClick={() => navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(item.word)}`)}
                >
                  #{item.word}
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
              {recent.map((doc, i) => (
                <DocumentCard
                  key={i}
                  {...doc}
                  showSimilarity={false}
                  onClick={() => {
                    const found = rawDocs.find(d => d.docId === doc.id || d.title === doc.title);
                    if (found) setSelectedDoc(found);
                    else setSelectedDoc({ docId: doc.id || '', title: doc.title, content: doc.description, categoria: doc.category, probabilidadCategoria: (doc.similarity || 85) / 100, keywords: doc.tags });
                  }}
                />
              ))}
            </div>
          </section>

          <section className="home-section fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="section-header">
              <h2 className="section-title">Recomendaciones para ti</h2>
              <Link to={ROUTES.RECOMMENDATIONS} className="section-link">Ver más <ArrowRight size={14} /></Link>
            </div>
            <div className="doc-list">
              {recommendations.map((doc, i) => (
                <DocumentCard
                  key={i}
                  {...doc}
                  recommended
                  showSimilarity={true}
                  onClick={() => {
                    const found = rawDocs.find(d => d.docId === doc.id || d.title === doc.title);
                    if (found) setSelectedDoc(found);
                    else setSelectedDoc({ docId: doc.id || '', title: doc.title, content: doc.description, categoria: doc.category, probabilidadCategoria: (doc.similarity || 85) / 100, keywords: doc.tags });
                  }}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Modal de Detalle de Documento con Navegación Continua */}
      {selectedDoc && (
        <DocumentDetailModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onSelectDoc={setSelectedDoc}
        />
      )}

      {/* ── Panel lateral derecho: Gráfico Donut y Tendencias ── */}
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
                    <span className="side-legend-dot" style={{ background: arc.color }} />
                    <span className="side-legend-label" title={arc.label}>
                      {arc.label === 'Inteligencia Artificial' ? 'IA' : arc.label}
                    </span>
                    <strong className="side-legend-pct">{arc.pct}%</strong>
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
              {topKeywords.slice(0, 5).map((item, i) => (
                <div
                  key={item.word}
                  className="side-trend-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(item.word)}`)}
                >
                  <span className="side-trend-rank">#{i + 1}</span>
                  <span className="side-trend-kw">{item.word}</span>
                  <div className="side-trend-bar">
                    <div className="side-trend-fill" style={{ width: `${Math.max(30, 100 - i * 15)}%` }} />
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
