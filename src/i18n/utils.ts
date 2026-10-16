import { ui, defaultLang, type Lang, type UiKey } from './ui';

export function getLang(current: string | undefined): Lang {
  return current === 'pt' ? 'pt' : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UiKey, vars: Record<string, string | number> = {}): string {
    let s: string = ui[lang][key] ?? ui[defaultLang][key] ?? key;
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };
}

/** Prefix a site-relative path with the locale segment when needed. */
export function localePath(lang: Lang, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean === '/' ? '/' : clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/** The same path in the other language (for the EN/PT switch). */
export function switchLangPath(lang: Lang, pathname: string): string {
  const stripped = pathname.replace(/^\/pt(?=\/|$)/, '') || '/';
  return lang === 'pt' ? stripped : localePath('pt', stripped);
}

export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-PT' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDuration(seconds: number, lang: Lang): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}
