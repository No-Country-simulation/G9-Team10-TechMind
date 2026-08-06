export type ThemeMode = 'light' | 'dark';
export type AppLanguage = 'es' | 'en' | 'pt';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  recommendations: boolean;
  analysisComplete: boolean;
}

export interface ContentPreferences {
  showSimilarity: boolean;
  compactView: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  language: AppLanguage;
  profile: UserProfile;
  notifications: NotificationSettings;
  preferences: ContentPreferences;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'es',
  profile: {
    name: 'Nairobi B.',
    email: 'nairobi@techmind.io',
    role: 'Administrador',
  },
  notifications: {
    emailAlerts: true,
    recommendations: true,
    analysisComplete: false,
  },
  preferences: {
    showSimilarity: true,
    compactView: false,
  },
};
