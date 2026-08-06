import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORY_COLORS, THEME } from '@/utils/constants';
import './DocumentCard.css';

export interface DocumentCardProps {
  id?: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  similarity?: number;
  recommended?: boolean;
  showSimilarity?: boolean;
  to?: string;
}

export function DocumentCard({
  title,
  description,
  category,
  tags = [],
  similarity,
  recommended = false,
  showSimilarity = true,
  to,
}: DocumentCardProps) {
  const color = CATEGORY_COLORS[category] ?? THEME.primary;

  const content = (
    <article className="doc-card">
      <div className="doc-card-top">
        {recommended && (
          <span className="doc-badge-ai">
            <Sparkles size={11} />
            Recomendado por IA
          </span>
        )}
        {showSimilarity && similarity !== undefined && (
          <span className="doc-badge-sim">{similarity}% similitud</span>
        )}
      </div>

      <h3 className="doc-card-title">{title}</h3>
      {description && <p className="doc-card-desc">{description}</p>}

      <div className="doc-card-tags">
        <span
          className="doc-tag doc-tag-cat"
          style={{ background: `${color}12`, color, borderColor: `${color}25` }}
        >
          <CategoryIcon category={category} size={12} />
          {category}
        </span>
        {tags.slice(0, 3).map(tag => (
          <span key={tag} className="doc-tag">{tag}</span>
        ))}
      </div>
    </article>
  );

  if (to) {
    return <Link to={to} className="doc-card-link">{content}</Link>;
  }
  return content;
}
