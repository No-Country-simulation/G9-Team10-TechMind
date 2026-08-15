import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Palette, Bell, Compass } from 'lucide-react';
import { useSettings, type Language } from '@/context/SettingsContext';
import { useTranslations } from '@/utils/i18n';
import './Settings.css';

const SETTINGS_NAV = [
  { id: 'general',        icon: Palette },
  { id: 'preferencias',   icon: Globe },
  { id: 'notificaciones', icon: Bell },
  { id: 'bienvenida',     icon: Compass },
] as const;

type SettingsTab = typeof SETTINGS_NAV[number]['id'];

export function Settings() {
  const [active, setActive] = useState<SettingsTab>('general');
  const { draft, settings, updateDraft, setTheme, saveSettings, resetDraft, savedMessage } = useSettings();
  const t = useTranslations(draft.language);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(settings);

  const tabLabels: Record<SettingsTab, string> = {
    general: t.settings.general,
    preferencias: t.settings.preferences,
    notificaciones: t.settings.notifications,
    bienvenida: 'Bienvenida',
  };

  return (
    <main className="settings-page">
      <header className="page-header fade-up">
        <h1 className="page-title">{t.settings.title}</h1>
        <p className="page-description">{t.settings.description}</p>
      </header>

      <div className="settings-layout fade-up">
        <nav className="settings-nav">
          {SETTINGS_NAV.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`settings-nav-item${active === id ? ' active' : ''}`}
              onClick={() => setActive(id)}
            >
              <Icon size={16} />
              {tabLabels[id]}
            </button>
          ))}
        </nav>

        <div className="settings-panel">
          {active === 'general' && (
            <>
              <h2 className="settings-panel-title">{t.settings.generalTitle}</h2>

              <div className="settings-field">
                <label className="settings-label">{t.settings.theme}</label>
                <div className="theme-toggle">
                  <button
                    type="button"
                    className={`theme-btn${draft.theme === 'light' ? ' active' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    {t.settings.light}
                  </button>
                  <button
                    type="button"
                    className={`theme-btn${draft.theme === 'dark' ? ' active' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    {t.settings.dark}
                  </button>
                </div>
              </div>

              <div className="settings-field">
                <label className="settings-label" htmlFor="lang">{t.settings.language}</label>
                <select
                  id="lang"
                  className="input settings-select"
                  value={draft.language}
                  onChange={e => updateDraft('language', e.target.value as Language)}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </>
          )}



          {active === 'preferencias' && (
            <>
              <h2 className="settings-panel-title">{t.settings.preferencesTitle}</h2>

              <label className="settings-toggle">
                <span>{t.settings.showSimilarity}</span>
                <input
                  type="checkbox"
                  checked={draft.preferences.showSimilarity}
                  onChange={e => updateDraft('preferences', {
                    ...draft.preferences,
                    showSimilarity: e.target.checked,
                  })}
                />
                <span className="toggle-track" />
              </label>

              <label className="settings-toggle">
                <span>{t.settings.compactView}</span>
                <input
                  type="checkbox"
                  checked={draft.preferences.compactView}
                  onChange={e => updateDraft('preferences', {
                    ...draft.preferences,
                    compactView: e.target.checked,
                  })}
                />
                <span className="toggle-track" />
              </label>

              <div className="settings-field">
                <label className="settings-label" htmlFor="doc-lang">{t.settings.defaultLanguage}</label>
                <select
                  id="doc-lang"
                  className="input settings-select"
                  value={draft.preferences.defaultLanguage}
                  onChange={e => updateDraft('preferences', {
                    ...draft.preferences,
                    defaultLanguage: e.target.value as Language,
                  })}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </>
          )}

          {active === 'notificaciones' && (
            <>
              <h2 className="settings-panel-title">{t.settings.notificationsTitle}</h2>

              <label className="settings-toggle">
                <span>{t.settings.notifyEmail}</span>
                <input
                  type="checkbox"
                  checked={draft.notifications.email}
                  onChange={e => updateDraft('notifications', {
                    ...draft.notifications,
                    email: e.target.checked,
                  })}
                />
                <span className="toggle-track" />
              </label>

              <label className="settings-toggle">
                <span>{t.settings.notifyRecommendations}</span>
                <input
                  type="checkbox"
                  checked={draft.notifications.recommendations}
                  onChange={e => updateDraft('notifications', {
                    ...draft.notifications,
                    recommendations: e.target.checked,
                  })}
                />
                <span className="toggle-track" />
              </label>

              <label className="settings-toggle">
                <span>{t.settings.notifyAnalysis}</span>
                <input
                  type="checkbox"
                  checked={draft.notifications.analysisComplete}
                  onChange={e => updateDraft('notifications', {
                    ...draft.notifications,
                    analysisComplete: e.target.checked,
                  })}
                />
                <span className="toggle-track" />
              </label>
            </>
          )}

          {active === 'bienvenida' && (
            <>
              <h2 className="settings-panel-title">Pantalla de Bienvenida</h2>
              <div className="settings-field">
                <p style={{ color: 'var(--clr-text-muted)', marginBottom: 20 }}>
                  Puedes volver a ver la pantalla de introducción de TechMind en cualquier momento.
                </p>
                <Link to="/welcome" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
                  Ir a la Bienvenida
                </Link>
              </div>
            </>
          )}

          {savedMessage && (
            <p className="settings-toast" role="status">{t.settings.saved}</p>
          )}

          <div className="settings-actions">
            <button type="button" className="btn btn-primary settings-save" onClick={saveSettings}>
              {t.settings.save}
            </button>
            <button
              type="button"
              className="btn btn-ghost settings-cancel"
              onClick={resetDraft}
              disabled={!hasChanges}
            >
              {t.settings.cancel}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
