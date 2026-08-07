import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { ROUTES } from '@/utils/constants';
import { documentService } from '@/services/api';
import type { DocumentResponse } from '@/types';
import './Recommendations.css';

function docToCard(doc: DocumentResponse) {
  return {
    id: doc.docId,
    title: doc.title,
    description: doc.content?.slice(0, 140) + (doc.content && doc.content.length > 140 ? '…' : '') || 'Sin descripción disponible.',
    category: doc.categoria,
    tags: doc.keywords?.slice(0, 3) ?? [],
    similarity: Math.round(doc.probabilidadCategoria * 100),
    recommended: true,
  };
}

export function Recommendations() {
  const [docs, setDocs] = useState<ReturnType<typeof docToCard>[]>([]);
  const [loading, setLoading] = useState(true);


  const load = async () => {
    setLoading(true);
    try {
      const all = await documentService.getAll();
      // Los "recomendados" son los de mayor confianza de clasificación IA
      const top = [...all]
        .sort((a, b) => b.probabilidadCategoria - a.probabilidadCategoria)
        .slice(0, 12)
        .map(docToCard);
      setDocs(top);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
            <DocumentCard key={i} {...doc} to={ROUTES.LIBRARY} />
          ))}
        </div>
      )}
    </main>
  );
}
