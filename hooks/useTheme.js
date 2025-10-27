import { useEffect, useState, useCallback } from 'react';

const THEME_KEY = 'app_theme';

export default function useTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      const initial = stored || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    } catch (e) {
      // ignore (SSR or disabled localStorage)
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
        document.documentElement.setAttribute('data-theme', next);
      } catch (e) {}
      return next;
    });
  }, []);

  return { theme, setTheme, toggle };
}
