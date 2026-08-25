import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Compass, Search, RefreshCw, Layers, BookOpen } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { DocumentDetailModal } from '@/components/ui/DocumentDetailModal';
import { normalizeCategory, cleanDocTitle, cleanDocDescription } from '@/utils/constants';
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
          const sameCategory = corpus
            .filter(d => d.docId !== docId && normalizeCategory(d.categoria) === normalizeCategory(baseDoc.categoria))
            .slice(0, 6 - recList.length);
          recList.push(...sameCategory);
        }
      }

      setRecommendations(recList);
    } catch {
      // Fallback semántico local
      const baseDoc = corpus.find(d => String(d.docId) === String(docId));
      if (baseDoc) {
        const sameCategory = corpus
          .filter(d => d.docId !== docId && normalizeCategory(d.categoria) === normalizeCategory(baseDoc.categoria))
          .slice(0, 6);
        setRecommendations(sameCategory);
      }
    } finally {
      setRecsLoading(false);
    }
  };

  // Manejar cambio de documento base en el selector
  const handleSelectBaseDoc = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docId = e.target.value;
    setSelectedBaseDocId(docId);
    setCustomQuery('');
    loadRecommendationsForDoc(docId);
  };

  // Buscar recomendaciones por query libre
  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setRecsLoading(true);
    try {
      const res = await documentService.semanticSearch(customQuery.trim(), 8);
      const recList: DocumentResponse[] = [];

      if (res && res.resultados && res.resultados.length > 0) {
        res.resultados.forEach(r => {
          const match = allDocs.find(d => String(d.docId) === String(r.doc_id) || d.title === r.title);
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
      setRecommendations(recList);
    } catch {
      const q = customQuery.toLowerCase();
      const filtered = allDocs.filter(d =>
        d.title?.toLowerCase().includes(q) ||
        d.content?.toLowerCase().includes(q) ||
        d.categoria?.toLowerCase().includes(q)
      ).slice(0, 6);
      setRecommendations(filtered);
    } finally {
      setRecsLoading(false);
    }
  };

  // Documentos recomendados destacados por categorías
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allDocs.forEach(d => {
      if (d.categoria) set.add(normalizeCategory(d.categoria));
    });
    return ['Todas', ...Array.from(set).sort()];
  }, [allDocs]);

  const topFeaturedDocs = useMemo(() => {
    let list = [...allDocs];
    if (activeCategoryFilter !== 'Todas') {
      list = list.filter(d => normalizeCategory(d.categoria) === activeCategoryFilter);
    }
    // Ordenar por mayor probabilidad de categoría
    return list
      .sort((a, b) => (b.probabilidadCategoria || 0) - (a.probabilidadCategoria || 0))
      .slice(0, 6);
  }, [allDocs, activeCategoryFilter]);

  const baseDoc = allDocs.find(d => d.docId === selectedBaseDocId);

  return (
    <main className="rec-page">
      {/* ── HEADER ── */}
      <section className="rec-hero fade-up">
        <div className="rec-badge">
          <Sparkles size={13} />
          Motor de Similitud Vectorial
        </div>
        <h1 className="rec-title">Recomendaciones Inteligentes</h1>
        <p className="rec-subtitle">
          Descubre artículos y recursos técnicos con alta afinidad matemática y conceptual.
        </p>
      </section>

      {/* ── SECCIÓN 1: GENERADOR INTERACTIVO ── */}
      <section className="rec-generator-card fade-up" style={{ animationDelay: '0.08s' }}>
        <div className="rec-generator-header">
          <div className="rec-generator-title">
            <Compass size={18} style={{ color: 'var(--clr-primary)' }} />
            Generador de Afinidad
          </div>
          <span className="rec-generator-hint">
            Selecciona un documento de referencia o escribe un concepto libre
          </span>
        </div>

        <div className="rec-generator-controls">
          {/* Selector de Documento Base */}
          <div className="rec-select-group">
            <label htmlFor="base-doc-select" className="rec-label">
              <BookOpen size={13} /> Basado en un documento del catálogo:
            </label>
            <select
              id="base-doc-select"
              value={selectedBaseDocId}
              onChange={handleSelectBaseDoc}
              className="rec-select"
              disabled={loading || allDocs.length === 0}
            >
              {loading ? (
                <option>Cargando catálogo de documentos…</option>
              ) : allDocs.length === 0 ? (
                <option>No hay documentos disponibles</option>
              ) : (
                allDocs.map(d => (
                  <option key={d.docId} value={d.docId}>
                    [{normalizeCategory(d.categoria)}] {cleanDocTitle(d.title).slice(0, 65)}…
                  </option>
                ))
              )}
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
                placeholder="Ej. 'Criptografía', 'Kubernetes', 'Bases de Datos', 'Modelos de Lenguaje'…"
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
                ? `Artículos afines a "${cleanDocTitle(baseDoc.title)}":`
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
                  title={cleanDocTitle(doc.title)}
                  description={cleanDocDescription(doc.content, 130) || 'Sin descripción.'}
                  category={normalizeCategory(doc.categoria)}
                  tags={(doc.keywords ?? []).map(k => k?.trim()).filter(k => k && k.length > 1 && k.toLowerCase() !== 'sin tags').slice(0, 3)}
                  similarity={Math.round((doc.probabilidadCategoria ?? 0.90) * 100)}
                  recommended={true}
                  showSimilarity={true}
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
                title={cleanDocTitle(doc.title)}
                description={cleanDocDescription(doc.content, 130) || 'Sin descripción.'}
                category={normalizeCategory(doc.categoria)}
                tags={(doc.keywords ?? []).map(k => k?.trim()).filter(k => k && k.length > 1 && k.toLowerCase() !== 'sin tags').slice(0, 3)}
                similarity={Math.round((doc.probabilidadCategoria ?? 0.95) * 100)}
                recommended={true}
                showSimilarity={true}
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
