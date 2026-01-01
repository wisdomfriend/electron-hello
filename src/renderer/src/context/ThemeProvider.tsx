import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import { setTheme } from '@renderer/store/settings'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(state => state.settings.theme)

  useEffect(() => {
    // 从主进程获取主题
    window.api.getTheme().then(theme => {
      dispatch(setTheme(theme))
    }).catch(() => {
      // 如果获取失败，使用默认主题
      console.warn('Failed to get theme from main process, using default theme')
    })

    // 监听主题变化
    window.api.onThemeChanged(newTheme => {
      dispatch(setTheme(newTheme))
    })
  }, [dispatch])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    dispatch(setTheme(newTheme))
    window.api.setTheme(newTheme)
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
