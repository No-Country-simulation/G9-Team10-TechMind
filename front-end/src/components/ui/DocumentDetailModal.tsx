import { useState, useEffect } from 'react';
import { X, FileText, Tag, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORY_COLORS, THEME } from '@/utils/constants';
import { documentService } from '@/services/api';
import type { DocumentResponse, DocumentoSimilitudResponse } from '@/types';
import './DocumentDetailModal.css';

export interface DocumentDetailModalProps {
  doc: DocumentResponse | null;
  onClose: () => void;
  onSelectDoc?: (doc: DocumentResponse) => void;
}

export function DocumentDetailModal({ doc, onClose, onSelectDoc }: DocumentDetailModalProps) {
  const [currentDoc, setCurrentDoc] = useState<DocumentResponse | null>(doc);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<DocumentoSimilitudResponse[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  useEffect(() => {
    setCurrentDoc(doc);
  }, [doc]);

  useEffect(() => {
    if (!currentDoc) return;

    let isMounted = true;

    const loadDetailsAndRecs = async () => {
      setLoading(true);
      setRecsLoading(true);
      try {
        // Cargar documento completo si no tiene contenido o keywords
        if (!currentDoc.content || !currentDoc.keywords || currentDoc.keywords.length === 0) {
          try {
            const full = await documentService.getByTitle(currentDoc.title);
            if (isMounted && full) {
              setCurrentDoc(prev => ({ ...prev, ...full }));
            }
          } catch {
            // Continuar con los datos actuales
          }
        }

        // Cargar recomendaciones de IA
        if (currentDoc.docId) {
          try {
            const recs = await documentService.getRecommendations(currentDoc.docId, 4);
            if (isMounted) {
              setRecommendations(recs.resultados || []);
            }
          } catch {
            if (isMounted) setRecommendations([]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setRecsLoading(false);
        }
      }
    };

    loadDetailsAndRecs();

    return () => {
      isMounted = false;
    };
  }, [currentDoc?.docId, currentDoc?.title]);

  // Manejar clic en una recomendación para continuar navegando
  const handleRecommendationClick = async (rec: DocumentoSimilitudResponse) => {
    setLoading(true);
    try {
      let nextDoc: DocumentResponse | null = null;
      if (rec.doc_id) {
        try {
          nextDoc = await documentService.getById(rec.doc_id);
        } catch {
          nextDoc = await documentService.getByTitle(rec.title);
        }
      } else {
        nextDoc = await documentService.getByTitle(rec.title);
      }

      if (nextDoc) {
        setCurrentDoc(nextDoc);
        if (onSelectDoc) onSelectDoc(nextDoc);
      }
    } catch {
      // Fallback a vista preliminar
      const fallbackDoc: DocumentResponse = {
        docId: rec.doc_id,
        title: rec.title,
        content: rec.preview,
        categoria: 'General',
        probabilidadCategoria: rec.similarity_score,
        keywords: []
      };
      setCurrentDoc(fallbackDoc);
    } finally {
      setLoading(false);
    }
  };

  if (!currentDoc) return null;

  const category = currentDoc.categoria && currentDoc.categoria.trim() ? currentDoc.categoria : 'General';
  const color = CATEGORY_COLORS[category] ?? THEME.primary;
  const confidence = Math.round((currentDoc.probabilidadCategoria ?? 0.85) * 100);

  return (
    <div
      className="doc-modal-overlay fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="doc-modal-card scale-up">
        {/* Header */}
        <div className="doc-modal-header">
          <div className="doc-modal-header-info">
            <div className="doc-modal-icon" style={{ background: `${color}18`, color }}>
              <BookOpen size={22} />
            </div>
            <div className="doc-modal-title-area">
              <h2 className="doc-modal-title">{currentDoc.title}</h2>
              <div className="doc-modal-meta">
                <span
                  className="doc-modal-cat"
                  style={{ background: `${color}15`, color, borderColor: `${color}30` }}
                >
                  <CategoryIcon category={category} size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {category}
                </span>
                <span className="doc-modal-confidence">{confidence}% confianza IA</span>
                {currentDoc.nivel && (
                  <span className="doc-modal-level">· Nivel {currentDoc.nivel}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="doc-modal-close-btn"
            aria-label="Cerrar"
            title="Cerrar (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Keywords */}
        {currentDoc.keywords && currentDoc.keywords.length > 0 && (
          <div className="doc-modal-keywords">
            <Tag size={13} style={{ color: 'var(--clr-primary)', flexShrink: 0 }} />
            <div className="doc-modal-kw-list">
              {currentDoc.keywords.map(kw => (
                <span key={kw} className="doc-modal-kw-tag">#{kw}</span>
              ))}
            </div>
          </div>
        )}

        {/* Body / Content */}
        <div className="doc-modal-body">
          <div className="doc-modal-section-title">
            <FileText size={15} />
            <span>Contenido y Resumen Técnico</span>
          </div>

          {loading ? (
            <div className="doc-modal-loading">Cargando contenido completo…</div>
          ) : currentDoc.content ? (
            <div className="doc-modal-content-text">
              {currentDoc.content}
            </div>
          ) : (
            <div className="doc-modal-no-content">
              Sin descripción o contenido detallado cargado para este documento.
            </div>
          )}

          {/* Recomendaciones Semánticas / Navegación Continua */}
          <div className="doc-modal-recs-section">
            <div className="doc-modal-recs-header">
              <Sparkles size={15} style={{ color: 'var(--clr-primary)' }} />
              <span>Contenido Relacionado (Recomendado por IA)</span>
            </div>

            {recsLoading ? (
              <div className="doc-modal-loading" style={{ padding: '12px 0' }}>Buscando documentos similares…</div>
            ) : recommendations.length === 0 ? (
              <div className="doc-modal-no-content" style={{ padding: '8px 0' }}>
                No se encontraron documentos relacionados en el corpus actual.
              </div>
            ) : (
              <div className="doc-modal-recs-grid">
                {recommendations.map(rec => (
                  <button
                    key={rec.doc_id || rec.title}
                    type="button"
                    className="doc-modal-rec-card"
                    onClick={() => handleRecommendationClick(rec)}
                    title={`Abrir "${rec.title}"`}
                  >
                    <div className="doc-modal-rec-title">{rec.title}</div>
                    {rec.preview && (
                      <div className="doc-modal-rec-preview">{rec.preview.slice(0, 90)}…</div>
                    )}
                    <div className="doc-modal-rec-footer">
                      <span className="doc-modal-rec-sim">
                        {Math.round(rec.similarity_score * 100)}% similitud
                      </span>
                      <span className="doc-modal-rec-action">
                        Explorar <ArrowRight size={12} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
