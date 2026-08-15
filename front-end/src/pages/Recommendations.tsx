import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, FileText, Hash, ArrowRight } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { ROUTES } from '@/utils/constants';
import { documentService } from '@/services/api';
import type { DocumentResponse } from '@/types';
import './Recommendations.css';

export function Recommendations() {
  const [docs, setDocs] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [optionsDoc, setOptionsDoc] = useState<DocumentResponse | null>(null);
  const [detailsDoc, setDetailsDoc] = useState<DocumentResponse | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const all = await documentService.getAll();
      // Los "recomendados" son los de mayor confianza de clasificación IA
      const top = [...all]
        .sort((a, b) => b.probabilidadCategoria - a.probabilidadCategoria)
        .slice(0, 12);
      setDocs(top);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCardClick = (doc: DocumentResponse) => {
    setOptionsDoc(doc);
  };

  const handleViewDetails = () => {
    setDetailsDoc(optionsDoc);
    setOptionsDoc(null);
  };

  const handleGoToKeywords = () => {
    navigate('/keywords');
  };

  return (
    <main className="rec-page">
      <header className="rec-header fade-up">
        <div className="rec-header-icon">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="page-title">Documentos destacados</h1>
          <p className="page-description">
            Los documentos clasificados con mayor confianza por el modelo de IA
          </p>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
          Cargando documentos destacados…
        </div>
      ) : docs.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✨</div>
          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--clr-text)' }}>Sin documentos aún</div>
          <p style={{ fontSize: '0.85rem' }}>Analiza documentos en la página Analizar para verlos aquí.</p>
        </div>
      ) : (
        <div className="rec-grid stagger">
          {docs.map((doc, i) => (
            <DocumentCard 
              key={doc.docId || i} 
              id={doc.docId}
              title={doc.title}
              description={doc.content?.slice(0, 140) + (doc.content && doc.content.length > 140 ? '…' : '') || 'Sin descripción disponible.'}
              category={doc.categoria}
              tags={doc.keywords?.slice(0, 3) ?? []}
              similarity={Math.round(doc.probabilidadCategoria * 100)}
              recommended={true}
              onClick={() => handleCardClick(doc)}
            />
          ))}
        </div>
      )}

      {/* MODAL DE OPCIONES */}
      {optionsDoc && (
        <div className="doc-modal-overlay" onClick={() => setOptionsDoc(null)} style={{ zIndex: 1000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="doc-modal" onClick={e => e.stopPropagation()} style={{ background: 'var(--clr-bg)', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid var(--clr-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--clr-text)' }}>¿Qué deseas hacer?</h2>
              <button onClick={() => setOptionsDoc(null)} style={{ background: 'transparent', border: 'none', color: 'var(--clr-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={handleViewDetails} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', color: 'var(--clr-text)', transition: 'background 0.2s' }}>
                <div style={{ background: 'var(--clr-primary-light)', padding: '8px', borderRadius: '8px', color: 'var(--clr-primary)' }}>
                  <FileText size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>Ver detalles</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Abre el documento en modo lectura</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--clr-text-muted)' }} />
              </button>

              <button onClick={handleGoToKeywords} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', color: 'var(--clr-text)', transition: 'background 0.2s' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '8px', borderRadius: '8px', color: '#a855f7' }}>
                  <Hash size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>Ir a Keywords</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Explora las palabras clave</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--clr-text-muted)' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      {detailsDoc && (
        <div className="doc-modal-overlay" onClick={() => setDetailsDoc(null)} style={{ zIndex: 1000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="doc-modal" onClick={e => e.stopPropagation()} style={{ background: 'var(--clr-bg)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--clr-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div className="doc-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--clr-border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                <div className="doc-modal-icon" style={{ background: 'var(--clr-primary-light)', padding: '12px', borderRadius: '10px', color: 'var(--clr-primary)' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>{detailsDoc.title}</h2>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>{detailsDoc.categoria}</span>
                    <span style={{ color: 'var(--clr-text-muted)' }}>{Math.round((detailsDoc.probabilidadCategoria || 0) * 100)}% de precisión</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDetailsDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="doc-modal-body">
              <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '0.95rem', color: 'var(--clr-text)' }}>Contenido:</div>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {detailsDoc.content || 'Sin contenido detallado disponible.'}
              </p>
              
              {detailsDoc.keywords && detailsDoc.keywords.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--clr-text)' }}>Palabras Clave:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {detailsDoc.keywords.map(kw => (
                      <span key={kw} style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--clr-text-subtle)' }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
