import { Settings, Palette, Wrench, Brain, Lock, Cloud, Smartphone, Database, FlaskConical, Building, FileText } from 'lucide-react';

interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CategoryIcon({ category, size = 14, className = "cat-icon", style }: CategoryIconProps) {
  switch (category) {
    case 'Backend': return <Settings size={size} className={className} style={style} />;
    case 'Frontend': return <Palette size={size} className={className} style={style} />;
    case 'DevOps': return <Wrench size={size} className={className} style={style} />;
    case 'Data Science': return <Brain size={size} className={className} style={style} />;
    case 'Seguridad': return <Lock size={size} className={className} style={style} />;
    case 'Cloud': return <Cloud size={size} className={className} style={style} />;
    case 'Mobile': return <Smartphone size={size} className={className} style={style} />;
    case 'Base de Datos': return <Database size={size} className={className} style={style} />;
    case 'Testing': return <FlaskConical size={size} className={className} style={style} />;
    case 'Arquitectura': return <Building size={size} className={className} style={style} />;
    default: return <FileText size={size} className={className} style={style} />;
  }
}
