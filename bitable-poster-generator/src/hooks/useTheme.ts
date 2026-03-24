import { useEffect, useState } from 'react'
import { bitable, ThemeModeType } from '@lark-base-open/js-sdk'

export function useTheme() {
  const [theme, setTheme] = useState<ThemeModeType>(ThemeModeType.LIGHT)

  useEffect(() => {
    bitable.bridge.getTheme().then(setTheme).catch(() => {})

    const off = bitable.bridge.onThemeChange((event) => {
      setTheme(event.data.theme)
    })

    return () => { off() }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === ThemeModeType.DARK) {
      root.setAttribute('data-theme', 'dark')
      document.body.setAttribute('theme-mode', 'dark')
    } else {
      root.setAttribute('data-theme', 'light')
      document.body.removeAttribute('theme-mode')
    }
  }, [theme])

  return theme
}
