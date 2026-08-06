import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';
export type Language = 'es' | 'en' | 'pt';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export interface NotificationSettings {
  email: boolean;
  recommendations: boolean;
  analysisComplete: boolean;
}

export interface ContentPreferences {
  showSimilarity: boolean;
  compactView: boolean;
  defaultLanguage: Language;
}

export interface AppSettings {
  theme: Theme;
  language: Language;
  profile: UserProfile;
  notifications: NotificationSettings;
  preferences: ContentPreferences;
}

const STORAGE_KEY = 'techmind-settings';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'es',
  profile: {
    name: 'Nairobi B.',
    email: 'nairobi@techmind.io',
    role: 'Administrador',
  },
  notifications: {
    email: true,
    recommendations: true,
    analysisComplete: false,
  },
  preferences: {
    showSimilarity: true,
    compactView: false,
    defaultLanguage: 'es',
  },
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function applyLanguage(language: Language) {
  document.documentElement.lang = language;
}

/** Aplica tema e idioma antes del primer render (evita flash) */
export function bootstrapSettings() {
  const settings = loadSettings();
  applyTheme(settings.theme);
  applyLanguage(settings.language);
}

interface SettingsContextValue {
  settings: AppSettings;
  draft: AppSettings;
  setDraft: React.Dispatch<React.SetStateAction<AppSettings>>;
  updateDraft: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setTheme: (theme: Theme) => void;
  saveSettings: () => void;
  resetDraft: () => void;
  savedMessage: string | null;
  userInitials: string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'TM';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [draft, setDraft] = useState<AppSettings>(loadSettings);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    applyTheme(settings.theme);
    applyLanguage(settings.language);
  }, [settings.theme, settings.language]);

  const updateDraft = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
    setSavedMessage(null);
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setDraft(prev => ({ ...prev, theme }));
    setSettings(prev => {
      const next = { ...prev, theme };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    applyTheme(theme);
    setSavedMessage(null);
  }, []);

  const saveSettings = useCallback(() => {
    setSettings(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    applyTheme(draft.theme);
    applyLanguage(draft.language);
    setSavedMessage('saved');
    window.setTimeout(() => setSavedMessage(null), 3000);
  }, [draft]);

  const resetDraft = useCallback(() => {
    setDraft(settings);
    setSavedMessage(null);
  }, [settings]);

  const userInitials = useMemo(() => getInitials(settings.profile.name), [settings.profile.name]);

  const value = useMemo(
    () => ({
      settings,
      draft,
      setDraft,
      updateDraft,
      setTheme,
      saveSettings,
      resetDraft,
      savedMessage,
      userInitials,
    }),
    [settings, draft, updateDraft, setTheme, saveSettings, resetDraft, savedMessage, userInitials],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
