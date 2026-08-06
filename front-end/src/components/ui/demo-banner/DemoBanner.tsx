import { RefreshCw } from 'lucide-react';
import './DemoBanner.css';

interface DemoBannerProps {
  message: string;
  onRetry: () => void;
  filledAction?: boolean;
}

export function DemoBanner({ message, onRetry, filledAction = false }: DemoBannerProps) {
  return (
    <div className="demo-banner">
      {message}
      <button
        type="button"
        onClick={onRetry}
        className={`demo-banner-action${filledAction ? ' demo-banner-action--filled' : ''}`}
      >
        <RefreshCw size={11} /> Reintentar
      </button>
    </div>
  );
}
