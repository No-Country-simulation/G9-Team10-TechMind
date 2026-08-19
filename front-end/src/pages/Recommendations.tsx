import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Compass, Search, RefreshCw, Layers, BookOpen } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { DocumentDetailModal } from '@/components/ui/DocumentDetailModal';
import { documentService } from '@/services/api';
import type { DocumentResponse } from '@/types';
import './Recommendations.css';

export function Recommendations() {
  const [allDocs, setAllDocs] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBaseDocId, setSelectedBaseDocId] = useState<string>('');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [recommendations, setRecommendations] = useState<DocumentResponse[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentResponse | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('Todas');

  // Carga inicial del corpus
  useEffect(() => {
    setLoading(true);
    documentService.getAll()
      .then(docs => {
        setAllDocs(docs);
        if (docs.length > 0) {
          // Seleccionar por defecto el primer documento para generar recomendaciones
          setSelectedBaseDocId(docs[0].docId);
          loadRecommendationsForDoc(docs[0].docId, docs);
        }
      })
      .catch(() => {
        setAllDocs([]);
        setRecommendations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Cargar recomendaciones basadas en un docId
  const loadRecommendationsForDoc = async (docId: string, corpus = allDocs) => {
    if (!docId) return;
    setRecsLoading(true);
    try {
      const res = await documentService.getRecommendations(docId, 8);
      const recList: DocumentResponse[] = [];

      if (res && res.resultados && res.resultados.length > 0) {
        res.resultados.forEach(r => {
          const match = corpus.find(d => String(d.docId) === String(r.doc_id) || d.title === r.title);
          if (match) {
            recList.push({
              ...match,
              probabilidadCategoria: r.similarity_score || match.probabilidadCategoria
            });
          } else {
            recList.push({
              docId: r.doc_id || '',
              title: r.title,
              content: r.preview || '',
              categoria: 'Recomendado IA',
              probabilidadCategoria: r.similarity_score || 0.95,
              keywords: []
            });
          }
        });
      }

      // Si el backend devolvió pocas recomendaciones, complementar con documentos de la misma categoría o alta similitud
      if (recList.length < 4) {
        const baseDoc = corpus.find(d => String(d.docId) === String(docId));
        if (baseDoc) {
          const sameCategory = corpus.filter(d =>
            String(d.docId) !== String(docId) &&
            d.categoria === baseDoc.categoria &&
            !recList.some(r => r.title === d.title)
          );
          recList.push(...sameCategory.slice(0, 6 - recList.length));
        }
      }

      setRecommendations(recList);
    } catch {
      // Fallback a documentos similares por categoría
      const baseDoc = corpus.find(d => String(d.docId) === String(docId));
      if (baseDoc) {
        const related = corpus
          .filter(d => String(d.docId) !== String(docId))
          .sort((a, b) => {
            if (a.categoria === baseDoc.categoria && b.categoria !== baseDoc.categoria) return -1;
            if (b.categoria === baseDoc.categoria && a.categoria !== baseDoc.categoria) return 1;
            return (b.probabilidadCategoria || 0) - (a.probabilidadCategoria || 0);
          })
          .slice(0, 6);
        setRecommendations(related);
      }
    } finally {
      setRecsLoading(false);
    }
  };

  // Búsqueda de recomendaciones por tema personalizado
  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = customQuery.trim();
    if (!q) return;

    setRecsLoading(true);
    try {
      const searchResults = await documentService.search(q, 8);
      if (searchResults && searchResults.length > 0) {
        setRecommendations(searchResults);
      } else {
        // Fallback local por coincidencia de texto
        const qLower = q.toLowerCase();
        const matches = allDocs.filter(d =>
          d.title.toLowerCase().includes(qLower) ||
          d.content.toLowerCase().includes(qLower) ||
          (d.categoria && d.categoria.toLowerCase().includes(qLower)) ||
          (d.keywords && d.keywords.some(k => k.toLowerCase().includes(qLower)))
        );
        setRecommendations(matches.slice(0, 8));
      }
    } catch {
      const qLower = q.toLowerCase();
      const matches = allDocs.filter(d =>
        d.title.toLowerCase().includes(qLower) ||
        d.content.toLowerCase().includes(qLower) ||
        (d.categoria && d.categoria.toLowerCase().includes(qLower))
      );
      setRecommendations(matches.slice(0, 8));
    } finally {
      setRecsLoading(false);
    }
  };

  // Categorías presentes en los documentos
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    allDocs.forEach(d => {
      if (d.categoria && d.categoria.trim()) cats.add(d.categoria.trim());
    });
    return ['Todas', ...Array.from(cats).sort()];
  }, [allDocs]);

  // Documentos destacados de alta certeza
  const topFeaturedDocs = useMemo(() => {
    let list = [...allDocs].sort((a, b) => (b.probabilidadCategoria || 0) - (a.probabilidadCategoria || 0));
    if (activeCategoryFilter !== 'Todas') {
      list = list.filter(d => (d.categoria || 'General') === activeCategoryFilter);
    }
    return list.slice(0, 8);
  }, [allDocs, activeCategoryFilter]);

  const baseDoc = allDocs.find(d => String(d.docId) === String(selectedBaseDocId));

  return (
    <main className="rec-page">
      <header className="rec-header fade-up">
        <div className="rec-header-icon">
          <Sparkles size={26} />
        </div>
        <div>
          <h1 className="page-title">Motor de Recomendaciones IA</h1>
          <p className="page-description">
            Explora afinidades semánticas, descubre conexiones interdisciplinarias y navega artículos relacionados calculados por el modelo de IA.
          </p>
        </div>
      </header>

      {/* ── SECCIÓN 1: EXPLORADOR DE AFINIDADES SEMÁNTICAS ── */}
      <section className="rec-explorer-card fade-up">
        <div className="rec-explorer-header">
          <div className="rec-explorer-title">
            <Compass size={18} style={{ color: 'var(--clr-primary)' }} />
            <span>Generador de Recomendaciones por Afinidad</span>
          </div>
          <span className="rec-explorer-tag">IA Semántica</span>
        </div>

        <div className="rec-explorer-controls">
          {/* Selector de documento base */}
          <div className="rec-select-group">
            <label className="rec-label">
              <BookOpen size={13} /> Selecciona un documento de referencia:
            </label>
            <select
              value={selectedBaseDocId}
              onChange={e => {
                const id = e.target.value;
                setSelectedBaseDocId(id);
                setCustomQuery('');
                loadRecommendationsForDoc(id);
              }}
              className="rec-select"
            >
              {allDocs.map(d => (
                <option key={d.docId || d.title} value={d.docId}>
                  {d.title} ({d.categoria || 'General'})
                </option>
              ))}
            </select>
          </div>

          {/* O buscador por tema libre */}
          <form onSubmit={handleCustomSearch} className="rec-query-form">
            <label className="rec-label">
              <Search size={13} /> O busca recomendaciones por concepto libre:
            </label>
            <div className="rec-query-input-wrap">
              <input
                type="text"
                placeholder="Ej. 'Criptografía', 'CAR-T', 'Micro-redes', 'Modelos de Lenguaje'…"
                value={customQuery}
                onChange={e => setCustomQuery(e.target.value)}
                className="rec-query-input"
              />
              <button type="submit" className="btn btn-primary btn-sm rec-query-btn">
                Recomendar
              </button>
            </div>
          </form>
        </div>

        {/* Resultados del generador */}
        <div className="rec-results-area">
          <div className="rec-results-title">
            <span>
              {customQuery.trim()
                ? `Artículos recomendados para el tema "${customQuery.trim()}":`
                : baseDoc
                ? `Artículos afines a "${baseDoc.title}":`
                : 'Artículos recomendados:'}
            </span>
            {recsLoading && <RefreshCw size={14} className="spin" style={{ color: 'var(--clr-primary)' }} />}
          </div>

          {recsLoading ? (
            <div className="rec-loading">
              <Sparkles size={24} className="spin" style={{ color: 'var(--clr-primary)', marginBottom: 8 }} />
              <div>Calculando similitudes y afinidades semánticas…</div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rec-no-results">
              No se encontraron recomendaciones directas. Prueba seleccionando otro documento o concepto.
            </div>
          ) : (
            <div className="rec-grid stagger">
              {recommendations.map(doc => (
                <DocumentCard
                  key={doc.docId || doc.title}
                  id={doc.docId}
                  title={doc.title}
                  description={doc.content?.slice(0, 130) + (doc.content?.length > 130 ? '…' : '') || 'Sin descripción.'}
                  category={doc.categoria || 'General'}
                  tags={doc.keywords?.slice(0, 3) ?? []}
                  similarity={Math.round((doc.probabilidadCategoria ?? 0.90) * 100)}
                  recommended={true}
                  onClick={() => setSelectedDoc(doc)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SECCIÓN 2: DOCUMENTOS DESTACADOS POR CATEGORÍA ── */}
      <section className="rec-featured-section fade-up" style={{ animationDelay: '0.15s' }}>
        <div className="rec-featured-header">
          <div>
            <h2 className="rec-section-title">
              <Layers size={18} style={{ color: 'var(--clr-secondary)' }} />
              Lecturas Destacadas de Alta Precisión
            </h2>
            <p className="rec-section-sub">
              Documentos del corpus clasificados con mayor confianza por el modelo de IA
            </p>
          </div>

          {/* Chips de Categorías */}
          <div className="rec-chips-bar">
            {availableCategories.slice(0, 7).map(cat => (
              <button
                key={cat}
                type="button"
                className={`rec-chip ${activeCategoryFilter === cat ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rec-loading">Cargando lecturas destacadas…</div>
        ) : topFeaturedDocs.length === 0 ? (
          <div className="rec-no-results">Sin documentos en esta categoría.</div>
        ) : (
          <div className="rec-grid stagger">
            {topFeaturedDocs.map(doc => (
              <DocumentCard
                key={doc.docId || doc.title}
                id={doc.docId}
                title={doc.title}
                description={doc.content?.slice(0, 130) + (doc.content?.length > 130 ? '…' : '') || 'Sin descripción.'}
                category={doc.categoria || 'General'}
                tags={doc.keywords?.slice(0, 3) ?? []}
                similarity={Math.round((doc.probabilidadCategoria ?? 0.95) * 100)}
                recommended={true}
                onClick={() => setSelectedDoc(doc)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal de Detalle de Documento con Navegación Continua */}
      {selectedDoc && (
        <DocumentDetailModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onSelectDoc={setSelectedDoc}
        />
      )}
    </main>
  );
}
