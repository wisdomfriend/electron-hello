import Store from 'electron-store'

interface Config {
  theme: 'light' | 'dark'
  language: string
}

class ConfigManager {
  private store: Store<Config>

  constructor() {
    this.store = new Store<Config>({
      defaults: {
        theme: 'light',
        language: 'zh-CN'
      }
    })
  }

  getTheme(): 'light' | 'dark' {
    return this.store.get('theme', 'light')
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.store.set('theme', theme)
  }

  getLanguage(): string {
    return this.store.get('language', 'zh-CN')
  }

  setLanguage(language: string): void {
    this.store.set('language', language)
  }
}

export const configManager = new ConfigManager()
