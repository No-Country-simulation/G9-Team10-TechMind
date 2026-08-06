import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Upload, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { ROUTES } from '@/utils/constants';
import { documentService } from '@/services/api';
import type { DocumentResponse } from '@/types';
import './MyDocuments.css';

function docToCard(doc: DocumentResponse) {
  return {
    id: doc.docId,
    title: doc.title,
    description: doc.content?.slice(0, 120) + (doc.content?.length > 120 ? '…' : ''),
    category: doc.categoria,
    tags: doc.keywords?.slice(0, 3) ?? [],
    similarity: Math.round(doc.probabilidadCategoria * 100),
  };
}

type SearchMode = 'all' | 'title';

export function MyDocuments() {
  const [docs, setDocs] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setSearchTitle('');
    setSearchMode('all');
    setSearchError(null);
    documentService.getAll()
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Búsqueda por título exacto en el backend
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTitle.trim();
    if (!q) { load(); return; }

    if (q.includes('/') || q.includes('\\')) {
      setSearchError(`Búsqueda local: el término contiene caracteres no válidos para el servidor.`);
      setDocs(docs.filter(d => d.title?.toLowerCase().includes(q.toLowerCase())));
      setSearchMode('title');
      return;
    }

    setLoading(true);
    setSearchError(null);
    try {
      const doc = await documentService.getByTitle(q);
      setDocs([doc]);
      setSearchMode('title');
    } catch {
      setSearchError(`No se encontró ningún documento con el título "${searchTitle.trim()}"`);
      setDocs([]);
      setSearchMode('title');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar documento por Título
  const handleDelete = async (doc: DocumentResponse) => {
    if (!window.confirm(`¿Eliminar "${doc.title}"?`)) return;
    setDeleting(doc.docId);
    try {
      await documentService.deleteByTitle(doc.title);
      setDocs(prev => prev.filter(d => d.docId !== doc.docId));
    } catch {
      alert('Error al eliminar el documento.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="mydocs-page">
      <header className="mydocs-header fade-up">
        <div>
          <h1 className="page-title">Mis documentos</h1>
          <p className="page-description">Contenidos que has analizado y clasificado</p>
        </div>
        <div className="mydocs-actions">
          <Link to={ROUTES.ANALYZE} className="btn btn-ghost">
            <Upload size={16} /> Importar documento
          </Link>
          <Link to={ROUTES.ANALYZE} className="btn btn-primary">
            <Plus size={16} /> Nuevo documento
          </Link>
        </div>
      </header>

      {/* ── Barra de búsqueda por título ── */}
      <form
        onSubmit={handleSearch}
        style={{
          display: 'flex', gap: 8, marginBottom: 24,
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          alignItems: 'center',
        }}
      >
        <Search size={14} style={{ color: 'var(--clr-text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Buscar por título exacto…"
          value={searchTitle}
          onChange={e => {
            setSearchTitle(e.target.value);
            if (!e.target.value.trim() && searchMode === 'title') load();
          }}
          style={{
            background: 'none', border: 'none', outline: 'none',
            color: 'var(--clr-text)', fontSize: '0.875rem', flex: 1,
          }}
        />
        {searchTitle && (
          <button
            type="button"
            onClick={() => { setSearchTitle(''); load(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--clr-text-muted)', display: 'flex', padding: 2 }}
          >
            <X size={14} />
          </button>
        )}
        <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
      </form>

      {/* Indicador de modo búsqueda */}
      {searchMode === 'title' && !loading && (
        <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          📄 Búsqueda por título exacto
          <button
            type="button"
            onClick={load}
            style={{ background: 'none', border: 'none', color: 'var(--clr-primary)', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
          >
            Ver todos
          </button>
        </div>
      )}

      {searchError && (
        <div style={{ color: 'var(--clr-danger)', fontSize: '0.82rem', marginBottom: 16,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8, padding: '10px 14px' }}>
          {searchError}
        </div>
      )}

      {loading ? (
        <div className="mydocs-empty">Cargando documentos…</div>
      ) : docs.length === 0 && !searchError ? (
        <div className="mydocs-empty">
          <FileText size={40} strokeWidth={1.2} />
          <p>No tienes documentos aún</p>
          <Link to={ROUTES.ANALYZE} className="btn btn-primary">Analizar primer documento</Link>
          <button type="button" className="btn btn-ghost" onClick={load}>
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      ) : (
        <div className="mydocs-grid stagger">
          {docs.map(doc => (
            <div key={doc.docId} style={{ position: 'relative' }}>
              <DocumentCard {...docToCard(doc)} />
              <button
                onClick={() => handleDelete(doc)}
                disabled={deleting === doc.docId}
                title="Eliminar documento"
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 6, padding: '4px 6px',
                  color: 'var(--clr-danger)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  opacity: deleting === doc.docId ? 0.5 : 0.7,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = deleting === doc.docId ? '0.5' : '0.7')}
              >
                {deleting === doc.docId
                  ? <RefreshCw size={12} className="spin" />
                  : <Trash2 size={12} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
