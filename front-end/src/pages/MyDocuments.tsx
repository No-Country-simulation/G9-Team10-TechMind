import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Upload, RefreshCw, Search, X } from 'lucide-react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { Pagination } from '@/components/ui/Pagination';
import { ROUTES } from '@/utils/constants';
import { documentService } from '@/services/api';
import type { DocumentResponse } from '@/types';
import './MyDocuments.css';

const PAGE_SIZE = 12;

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

  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const sortedDocs = useMemo(() => {
    return [...docs].sort((_a, _b) => {
      // Como el backend no devuelve timestamp, asumimos que el array original de la BD 
      // viene ordenado ascendentemente por ID/inserción.
      // Así que simplemente invertimos (desc) o mantenemos (asc).
      return sortOrder === 'desc' ? -1 : 1;
    });
  }, [docs, sortOrder]);

  const totalPages = useMemo(() => Math.ceil(sortedDocs.length / PAGE_SIZE), [sortedDocs.length]);
  const pagedDocs = useMemo(
    () => sortedDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sortedDocs, currentPage]
  );

  const load = () => {
    setLoading(true);
    setSearchTitle('');
    setSearchMode('all');
    setSearchError(null);
    setCurrentPage(1);
    documentService.getAll()
      .then(data => setDocs([...data])) // Guardamos como viene de la BD para poder ordenar después
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
    setCurrentPage(1);
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

  // Funcionalidad de eliminación deshabilitada porque el backend no expone el endpoint.

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
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--clr-text-muted)', display: 'flex', padding: 2
            }}
          >
            <X size={14} />
          </button>
        )}
        <button type="submit" className="btn btn-primary btn-sm">Buscar</button>

        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as 'desc' | 'asc')}
          style={{
            background: 'none', border: '1px solid var(--clr-border)',
            color: 'var(--clr-text)', borderRadius: 'var(--radius-sm)',
            padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          <option value="desc">Más recientes primero</option>
          <option value="asc">Más antiguos primero</option>
        </select>
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
        <div style={{
          color: 'var(--clr-danger)', fontSize: '0.82rem', marginBottom: 16,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8, padding: '10px 14px'
        }}>
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
        <>
          <div className="mydocs-grid stagger">
            {pagedDocs.map(doc => (
              <div key={doc.docId} style={{ position: 'relative' }}>
                <DocumentCard {...docToCard(doc)} />
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={page => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </>
      )}
    </main>
  );
}
