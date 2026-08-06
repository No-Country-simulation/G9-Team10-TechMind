import { CategoryIcon } from '@/components/ui/category-icon/CategoryIcon';
import { CATEGORY_COLORS, THEME } from '@/utils/constants';
import { accentColor } from '@/utils/cssVars';
import './CatBadge.css';

interface CatBadgeProps {
  category: string;
  color?: string;
  iconSize?: number;
}

export function CatBadge({ category, color, iconSize = 14 }: CatBadgeProps) {
  const accent = color ?? CATEGORY_COLORS[category] ?? THEME.primary;

  return (
    <span className="cat-badge cat-badge-colored" style={accentColor(accent)}>
      <CategoryIcon category={category} size={iconSize} />
      <span>{category}</span>
    </span>
  );
}
