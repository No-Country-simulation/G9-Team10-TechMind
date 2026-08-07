import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      marginTop: 32,
      paddingTop: 24,
      borderTop: '1px solid var(--clr-border)',
      width: '100%',
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: 8, padding: '6px 12px',
          color: currentPage === 1 ? 'var(--clr-text-muted)' : 'var(--clr-text)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: currentPage === 1 ? 0.5 : 1,
        }}
      >
        <ChevronLeft size={16} /> Anterior
      </button>

      <div style={{ fontSize: '0.875rem', color: 'var(--clr-text-muted)', fontWeight: 500 }}>
        Página <span style={{ color: 'var(--clr-text-bright)' }}>{currentPage}</span> de {totalPages}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: 8, padding: '6px 12px',
          color: currentPage === totalPages ? 'var(--clr-text-muted)' : 'var(--clr-text)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: currentPage === totalPages ? 0.5 : 1,
        }}
      >
        Siguiente <ChevronRight size={16} />
      </button>
    </div>
  );
}
