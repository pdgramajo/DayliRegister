import { useState, useEffect, useCallback } from 'react'
import { STORAGE_NAMESPACE } from '../constants/storage'

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

type Theme = (typeof THEMES)[keyof typeof THEMES]

const THEME_KEY = `${STORAGE_NAMESPACE}theme`

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return THEMES.LIGHT
  const stored = localStorage.getItem(THEME_KEY) as Theme | null
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEMES.DARK
    : THEMES.LIGHT
}

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === THEMES.DARK)
  localStorage.setItem(THEME_KEY, theme)
}

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) =>
      prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    )
  }, [])

  return { theme, toggleTheme, isDark: theme === THEMES.DARK }
}
