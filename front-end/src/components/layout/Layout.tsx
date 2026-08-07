import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import logoImg from '@/assets/icon.png';
import techVideo from '@/assets/Tech.mp4';
import {
  Home,
  Search,
  Library,
  Sparkles,
  FileText,
  Settings,
  Brain,
  LayoutDashboard,
  Menu,
} from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { useSettings } from '@/context/SettingsContext';
import { useTranslations } from '@/utils/i18n';
import './Layout.css';

const navItems = [
  { to: ROUTES.HOME,            key: 'home' as const,            icon: Home },
  { to: ROUTES.SEARCH,          key: 'search' as const,          icon: Search },
  { to: ROUTES.LIBRARY,         key: 'library' as const,         icon: Library },
  { to: ROUTES.RECOMMENDATIONS, key: 'recommendations' as const, icon: Sparkles },
  { to: ROUTES.MY_DOCS,         key: 'myDocs' as const,          icon: FileText },
  { to: ROUTES.DASHBOARD,       key: 'dashboard' as const,       icon: LayoutDashboard },
  { to: ROUTES.SETTINGS,        key: 'settings' as const,        icon: Settings },
];

export function Layout() {
  const { settings, userInitials } = useSettings();
  const t = useTranslations(settings.language);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={`layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <video autoPlay loop muted playsInline className="app-video-bg">
        <source src={techVideo} type="video/mp4" />
      </video>
      <div className="app-video-overlay" />

      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header-wrapper" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--clr-border)', paddingRight: '16px' }}>
          <NavLink to={ROUTES.HOME} className="sidebar-brand" style={{ flex: 1, borderBottom: 'none' }}>
            <div className="sidebar-logo">
              <Brain size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="sidebar-title">
                TECH <span className="sidebar-title-accent">MIND</span>
              </div>
            </div>
          </NavLink>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)' }}
            title="Contraer menú"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon className="nav-item-icon" size={18} />
              {t.nav[key]}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-blurred-bg">
          <img src={logoImg} alt="" />
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{userInitials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{settings.profile.name}</span>
              <NavLink to={ROUTES.SETTINGS} className="sidebar-user-link">
                {t.nav.viewProfile}
              </NavLink>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        {!isSidebarOpen && (
          <button 
            className="menu-toggle-floating" 
            onClick={() => setIsSidebarOpen(true)}
            title="Abrir menú lateral"
          >
            <Menu size={24} />
          </button>
        )}
        <div className="page-scroll-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
