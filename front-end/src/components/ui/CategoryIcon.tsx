import { Settings, Palette, Wrench, Brain, Lock, Cloud, Smartphone, Database, FlaskConical, Building, FileText } from 'lucide-react';

interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 14, className = "cat-icon" }: CategoryIconProps) {
  switch (category) {
    case 'Backend': return <Settings size={size} className={className} />;
    case 'Frontend': return <Palette size={size} className={className} />;
    case 'DevOps': return <Wrench size={size} className={className} />;
    case 'Data Science': return <Brain size={size} className={className} />;
    case 'Seguridad': return <Lock size={size} className={className} />;
    case 'Cloud': return <Cloud size={size} className={className} />;
    case 'Mobile': return <Smartphone size={size} className={className} />;
    case 'Base de Datos': return <Database size={size} className={className} />;
    case 'Testing': return <FlaskConical size={size} className={className} />;
    case 'Arquitectura': return <Building size={size} className={className} />;
    default: return <FileText size={size} className={className} />;
  }
}
