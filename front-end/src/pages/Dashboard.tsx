import { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  FileText, Layers, TrendingUp, Zap,
  ArrowUpRight, ArrowDownRight, Sparkles, Clock,
} from 'lucide-react';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/utils/constants';
import {
  mockStats, mockCategories, mockKeywords,
  mockRecentActivity, mockWeeklyData,
} from '@/utils/mockData';
import type { DashboardStats, CategoryStat, KeywordStat, RecentActivity } from '@/types';
import './Dashboard.css';

/* ── helpers ── */
function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)  return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

/* ── StatCard ── */
interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  change: number;
  delay?: number;
}

function StatCard({ label, value, suffix = '', icon, color, change, delay = 0 }: StatCardProps) {
  const animated = useCountUp(value);
  return (
    <div className="stat-card fade-up" style={{ animationDelay: `${delay}s` }}>
      <div
        className="stat-card-glow"
        style={{ background: color }}
      />
      <div className="stat-header">
        <div
          className="stat-icon-wrap"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
        <span className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
          {change >= 0
            ? <ArrowUpRight size={12} />
            : <ArrowDownRight size={12} />}
          {Math.abs(change)}%
        </span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {suffix === '%'
          ? `${animated.toFixed(0)}%`
          : suffix === 'k'
          ? animated > 999 ? `${(animated / 1000).toFixed(1)}k` : animated
          : animated}
        {suffix !== '%' && suffix !== 'k' ? suffix : ''}
      </div>
    </div>
  );
}

/* ── CustomTooltip ── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--clr-bg-2)',
      border: '1px solid var(--clr-border-strong)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontSize: '0.78rem',
    }}>
      <div style={{ color: 'var(--clr-text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

/* ── CategoryRow ── */
function CategoryRow({ cat, index }: { cat: CategoryStat; index: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      if (barRef.current) barRef.current.style.width = `${cat.porcentaje}%`;
    }, 300 + index * 80);
    return () => clearTimeout(t);
  }, [cat.porcentaje, index]);

  return (
    <div className="category-row">
      <div className="category-dot" style={{ background: cat.color }} />
      <span className="category-name">{cat.categoria}</span>
      <div className="category-bar-wrap">
        <div
          ref={barRef}
          className="category-bar"
          style={{ background: cat.color, width: '0%' }}
        />
      </div>
      <span className="category-pct">{cat.porcentaje.toFixed(1)}%</span>
    </div>
  );
}

/* ── Dashboard Page ── */
export function Dashboard() {
  const [stats] = useState<DashboardStats>(mockStats);
  const [categories] = useState<CategoryStat[]>(mockCategories);
  const [keywords] = useState<KeywordStat[]>(mockKeywords.slice(0, 12));
  const [activity] = useState<RecentActivity[]>(mockRecentActivity);

  const statCards = [
    {
      label: 'Total Documentos',
      value: stats.total_documentos,
      suffix: '',
      icon: <FileText size={20} color="#6366f1" />,
      color: '#6366f1',
      change: +12,
    },
    {
      label: 'Categorías Activas',
      value: stats.categorias_activas,
      suffix: '',
      icon: <Layers size={20} color="#06b6d4" />,
      color: '#06b6d4',
      change: +2,
    },
    {
      label: 'Precisión Promedio',
      value: Math.round(stats.precision_promedio),
      suffix: '%',
      icon: <TrendingUp size={20} color="#10b981" />,
      color: '#10b981',
      change: +3,
    },
    {
      label: 'Docs Hoy',
      value: stats.documentos_hoy,
      suffix: '',
      icon: <Zap size={20} color="#a855f7" />,
      color: '#a855f7',
      change: +8,
    },
  ];

  return (
    <main className="page-container">
      {/* Demo banner */}
      <div className="demo-banner">
        <Sparkles size={14} />
        <span><strong>Modo Demo:</strong> visualizando datos de muestra — conecta el backend Spring Boot en <code>localhost:8080</code> para datos reales.</span>
      </div>

      {/* Header */}
      <header className="page-header">
        <h1 className="page-title">Dashboard de Conocimiento</h1>
        <p className="page-description">Métricas en tiempo real de tu base de contenido técnico</p>
      </header>

      {/* Stats */}
      <div className="stats-grid stagger">
        {statCards.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.07} />
        ))}
      </div>

      {/* Charts */}
      <div className="charts-row">
        {/* Weekly Area Chart */}
        <div className="chart-card fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="chart-card-header">
            <div>
              <div className="chart-title">Documentos Analizados</div>
              <div className="chart-subtitle">Actividad de los últimos 7 días</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockWeeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="grad-docs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-prec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="dia" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="documentos" name="Documentos"
                stroke="#6366f1" strokeWidth={2.5}
                fill="url(#grad-docs)" dot={false}
              />
              <Area
                type="monotone" dataKey="promedio_precision" name="Precisión"
                stroke="#10b981" strokeWidth={2}
                fill="url(#grad-prec)" dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Donut */}
        <div className="chart-card fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="chart-card-header">
            <div>
              <div className="chart-title">Por Categoría</div>
              <div className="chart-subtitle">Distribución del corpus</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie
                data={categories} cx="50%" cy="50%"
                innerRadius={30} outerRadius={50}
                paddingAngle={3} dataKey="count"
              >
                {categories.map((c) => (
                  <Cell key={c.categoria} fill={c.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number, name: string) => [`${val} docs`, name]}
                contentStyle={{
                  background: 'var(--clr-bg-2)',
                  border: '1px solid var(--clr-border-strong)',
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="categories-list stagger">
            {categories.slice(0, 6).map((cat, i) => (
              <CategoryRow key={cat.categoria} cat={cat} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="bottom-row">
        {/* Recent Activity */}
        <div className="activity-card fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="activity-header">
            <div className="activity-title">Actividad Reciente</div>
            <a href="/history" style={{ fontSize: '0.78rem', color: 'var(--clr-primary-light)', textDecoration: 'none' }}>
              Ver todo →
            </a>
          </div>
          <div className="activity-list stagger">
            {activity.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-icon">
                  {CATEGORY_ICONS[item.categoria] ?? '📄'}
                </div>
                <div className="activity-info">
                  <div className="activity-item-title">{item.titulo}</div>
                  <div className="activity-meta">
                    <span
                      className="activity-category"
                      style={{ background: `${CATEGORY_COLORS[item.categoria] ?? '#6366f1'}18`, color: CATEGORY_COLORS[item.categoria] ?? 'var(--clr-primary-light)' }}
                    >
                      {item.categoria}
                    </span>
                    <span className="activity-time">
                      <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
                      {timeAgo(item.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="activity-confidence">
                  {(item.probabilidad * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="quick-card fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="quick-card-header">
            <div className="quick-card-title">Top Keywords</div>
            <a href="/keywords" style={{ fontSize: '0.78rem', color: 'var(--clr-primary-light)', textDecoration: 'none' }}>
              Ver todas →
            </a>
          </div>
          <div className="keyword-cloud stagger">
            {keywords.map((kw, i) => {
              const maxF = keywords[0].frecuencia;
              const ratio = kw.frecuencia / maxF;
              const size = 0.72 + ratio * 0.26;
              const alpha = 0.08 + ratio * 0.18;
              return (
                <div
                  key={kw.keyword}
                  className="keyword-chip"
                  style={{
                    fontSize: `${size}rem`,
                    background: `rgba(99,102,241,${alpha})`,
                    borderColor: `rgba(99,102,241,${alpha * 2})`,
                    color: ratio > 0.6 ? 'var(--clr-primary-light)' : 'var(--clr-text-subtle)',
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  {kw.keyword}
                  <span className="keyword-freq">{kw.frecuencia}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
