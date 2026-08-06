import type { CSSProperties } from 'react';

/** Asigna CSS custom properties de forma tipada */
export function cssVars(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties;
}

export function accentColor(color: string): CSSProperties {
  return cssVars({ '--accent-color': color });
}

export function fadeDelay(seconds: number): CSSProperties {
  return cssVars({ '--delay': `${seconds}s` });
}

export function barWidth(pct: number, color?: string): CSSProperties {
  return cssVars({
    '--bar-width': `${pct}%`,
    ...(color ? { '--accent-color': color } : {}),
  });
}
