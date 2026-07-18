import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Clock,
  Tag,
  Brain,
  Settings,
  Search,
  Bell,
  Zap,
} from 'lucide-react';
import './Layout.css';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard, badge: null },
  { to: '/analyze',    label: 'Analizar',    icon: Sparkles,        badge: 'AI' },
  { to: '/history',    label: 'Historial',   icon: Clock,           badge: null },
  { to: '/keywords',   label: 'Keywords',    icon: Tag,             badge: null },
];

export function Layout() {
  return (
    <div className="layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <NavLink to="/dashboard" className="sidebar-brand">
          <div className="sidebar-logo">🧠</div>
          <div>
            <div className="sidebar-title">TechMind</div>
            <div className="sidebar-subtitle">AI Knowledge Hub</div>
          </div>
        </NavLink>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Principal</div>
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon className="nav-item-icon" size={18} />
              {label}
              {badge && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}

          <div className="nav-section-label">Sistema</div>
          <button className="nav-item">
            <Settings className="nav-item-icon" size={18} />
            Configuración
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <div className="status-dot" />
            <span className="status-text">API conectada</span>
            <Zap size={12} style={{ marginLeft: 'auto', color: 'var(--clr-success)' }} />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">TechMind Platform</span>
            <span className="topbar-breadcrumb">Organización Inteligente de Contenido</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search size={14} />
              Buscar contenido…
            </div>
            <button className="topbar-icon-btn" aria-label="Notificaciones">
              <Bell size={16} />
            </button>
            <button className="topbar-icon-btn" aria-label="Modelo AI">
              <Brain size={16} />
            </button>
            <div className="topbar-avatar" title="Usuario">
              TM
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
