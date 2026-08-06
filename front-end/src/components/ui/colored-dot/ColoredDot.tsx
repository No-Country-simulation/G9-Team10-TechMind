import { accentColor } from '@/utils/cssVars';
import './ColoredDot.css';

interface ColoredDotProps {
  color: string;
}

export function ColoredDot({ color }: ColoredDotProps) {
  return <span className="colored-dot category-dot-colored" style={accentColor(color)} />;
}
