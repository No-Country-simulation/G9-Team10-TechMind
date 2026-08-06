import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORY_COLORS, THEME, ROUTES } from '@/utils/constants';
import { documentService } from '@/services/api';
import type { DocumentResponse } from '@/types';
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

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<ReturnType<typeof docToCard>[]>([]);
  const [recommendations, setRecommendations] = useState<(ReturnType<typeof docToCard> & { recommended: boolean })[]>([]);

  const [categoryCounts, setCategoryCounts] = useState<{ id: string; label: string; color: string; count: number }[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    documentService.getAll()
      .then(docs => {
        if (docs.length > 0) {
          setTotalDocs(docs.length);
          setRecent(docs.slice(0, 4).map(docToCard));

          // Top por confianza IA
          const top = [...docs]
            .sort((a, b) => b.probabilidadCategoria - a.probabilidadCategoria)
            .slice(0, 3)
            .map(d => ({ ...docToCard(d), recommended: true }));
          setRecommendations(top);

          // Agrupar por categoría, contar y ordenar por cantidad desc
          const map: Record<string, number> = {};
          docs.forEach(d => {
            if (d.categoria) map[d.categoria] = (map[d.categoria] || 0) + 1;
          });
          const cats = Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .map(([id, count]) => ({
              id,
              label: id,
              color: CATEGORY_COLORS[id] ?? THEME.primary,
              count,
            }));
          setCategoryCounts(cats);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="home-page">
      {/* Hero */}
      <section className="home-hero fade-up">
        <h1 className="home-title">Bienvenido a TechMind</h1>
        <p className="home-subtitle">
          Organiza, analiza y explora tu corpus de conocimiento técnico.
        </p>

        <form className="home-search" onSubmit={handleSearch}>
          <Search size={18} className="home-search-icon" />
          <input
            type="text"
            placeholder="Buscar documentos, keywords o categorías…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary home-search-btn">
            Buscar
          </button>
        </form>
      </section>

      {/* Categories */}
      <section className="home-section fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="section-header">
          <h2 className="section-title">Explora por categorías</h2>
          {totalDocs > 0 && (
            <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
              {totalDocs} documentos en total
            </span>
          )}
        </div>

        {/* Abecedario */}
        {categoryCounts.length > 0 && (
          <div className="kw-alpha-filter" style={{ justifyContent: 'flex-start', padding: '0 0 16px 0' }}>
            <button
              className={`kw-alpha-btn ${!selectedLetter ? 'active' : ''}`}
              onClick={() => setSelectedLetter(null)}
            >
              Todas
            </button>
            {ALPHABET.filter(l => categoryCounts.some(c => c.id.toUpperCase().startsWith(l))).map(letter => (
              <button
                key={letter}
                className={`kw-alpha-btn ${selectedLetter === letter ? 'active' : ''}`}
                onClick={() => setSelectedLetter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        <div className="category-grid">
          {categoryCounts
            .filter(cat => !selectedLetter || cat.id.toUpperCase().startsWith(selectedLetter))
            .map(cat => (
            <button
              key={cat.id}
              type="button"
              className="category-card"
              onClick={() => navigate(`${ROUTES.SEARCH}?cat=${encodeURIComponent(cat.id)}`)}
            >
              <div
                className="category-icon-wrap"
                style={{ background: `${cat.color}12`, color: cat.color }}
              >
                <CategoryIcon category={cat.id} size={22} />
              </div>
              <span className="category-label">{cat.label}</span>
              <span className="category-count">{cat.count} docs</span>
            </button>
          ))}
          {categoryCounts.filter(cat => !selectedLetter || cat.id.toUpperCase().startsWith(selectedLetter)).length === 0 && (
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', gridColumn: '1/-1', textAlign: 'center', padding: '24px 0' }}>
              {categoryCounts.length === 0
                ? 'Sin documentos aún — analiza tu primer contenido.'
                : `No hay categorías con la letra "${selectedLetter}".`}
            </p>
          )}
        </div>
      </section>

      {/* Recent + Recommendations */}
      <div className="home-columns">
        <section className="home-section fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <h2 className="section-title">Documentos recientes</h2>
            <Link to={ROUTES.LIBRARY} className="section-link">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="doc-list">
            {recent.map((doc, i) => (
              <DocumentCard key={i} {...doc} to={ROUTES.LIBRARY} />
            ))}
          </div>
        </section>

        <section className="home-section fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="section-header">
            <h2 className="section-title">Recomendaciones para ti</h2>
            <Link to={ROUTES.RECOMMENDATIONS} className="section-link">
              Ver más <ArrowRight size={14} />
            </Link>
          </div>
          <div className="doc-list">
            {recommendations.map((doc, i) => (
              <DocumentCard key={i} {...doc} recommended to={ROUTES.RECOMMENDATIONS} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
