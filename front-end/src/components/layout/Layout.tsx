import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import logoImg from '@/assets/icon.png';
import videoClaro from '@/assets/ModoClaroTM.mp4';
import videoOscuro from '@/assets/ModoOscuroTM-LM&DM.mp4';
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
  X,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { useSettings } from '@/context/SettingsContext';
import { useTranslations } from '@/utils/i18n';
import './Layout.css';

const navItems = [
  { to: ROUTES.HOME, key: 'home' as const, icon: Home },
  { to: ROUTES.SEARCH, key: 'search' as const, icon: Search },
  { to: ROUTES.LIBRARY, key: 'library' as const, icon: Library },
  { to: ROUTES.RECOMMENDATIONS, key: 'recommendations' as const, icon: Sparkles },
  { to: ROUTES.MY_DOCS, key: 'myDocs' as const, icon: FileText },
  { to: ROUTES.ANALYZE, key: 'analyze' as const, icon: Brain },
  { to: ROUTES.DASHBOARD, key: 'dashboard' as const, icon: LayoutDashboard },
  { to: ROUTES.SETTINGS, key: 'settings' as const, icon: Settings },
];

export function Layout() {
  const { settings, setTheme, userInitials } = useSettings();
  const t = useTranslations(settings.language);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cerrar menú móvil automáticamente al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(settings.theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
      <video key={settings.theme} autoPlay loop muted playsInline className="app-video-bg">
        <source src={settings.theme === 'dark' ? videoOscuro : videoClaro} type="video/mp4" />
      </video>
      <div className="app-video-overlay" />

      {/* Topbar móvil (solo visible en pantallas <= 768px) */}
      <header className="mobile-topbar">
        <NavLink to={ROUTES.HOME} className="mobile-topbar-brand" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-topbar-logo">
            <Brain size={20} strokeWidth={2.5} />
          </div>
          <div className="mobile-topbar-title">
            TECH <span className="mobile-topbar-accent">MIND</span>
          </div>
        </NavLink>

        <div className="mobile-topbar-actions">
          <button
            onClick={toggleTheme}
            className="mobile-action-btn"
            title={settings.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Cambiar tema"
          >
            {settings.theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-action-btn mobile-menu-toggle"
            title={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-label="Menú principal"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Backdrop para cerrar drawer al tocar afuera en móvil */}
      {isMobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header-wrapper">
          <NavLink to={ROUTES.HOME} className="sidebar-brand" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="sidebar-logo">
              <Brain size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="sidebar-title">
                TECH <span className="sidebar-title-accent">MIND</span>
              </div>
            </div>
          </NavLink>
          
          {/* Botón contraer en escritorio */}
          <button
            className="sidebar-collapse-btn desktop-only"
            onClick={() => setIsSidebarOpen(false)}
            title="Contraer menú"
          >
            <Menu size={20} />
          </button>

          {/* Botón cerrar en móvil */}
          <button
            className="sidebar-close-btn mobile-only"
            onClick={() => setIsMobileMenuOpen(false)}
            title="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon className="nav-item-icon" size={18} />
              <span className="nav-item-text">{t.nav[key]}</span>
              <ChevronRight className="nav-item-arrow mobile-only" size={14} />
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar con cambio rápido de tema y usuario */}
        <div className="sidebar-footer">
          <div className="sidebar-quick-actions">
            <button
              onClick={toggleTheme}
              className="sidebar-theme-toggle-btn"
              title={settings.theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {settings.theme === 'dark' ? (
                <>
                  <Sun size={16} />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon size={16} />
                  <span>Modo Oscuro</span>
                </>
              )}
            </button>
          </div>

          <NavLink
            to={ROUTES.SETTINGS}
            onClick={() => setIsMobileMenuOpen(false)}
            className="sidebar-user"
          >
            <div className="sidebar-user-avatar">{userInitials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{settings.profile.name}</span>
              <span className="sidebar-user-link">{settings.profile.role}</span>
            </div>
          </NavLink>
        </div>

        <div className="sidebar-blurred-bg">
          <img src={logoImg} alt="" />
        </div>
      </aside>

      <div className="main-content">
        {!isSidebarOpen && (
          <button
            className="menu-toggle-floating desktop-only"
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
