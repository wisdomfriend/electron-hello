import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getAppInfo: () => Promise<{
        version: string
        isPackaged: boolean
        appPath: string
        filesPath: string
        appDataPath: string
      }>
      reload: () => Promise<void>
      restart: () => Promise<void>
      openWebsite: (url: string) => Promise<void>
      setTheme: (theme: 'light' | 'dark') => Promise<void>
      getTheme: () => Promise<'light' | 'dark'>
      setLanguage: (lang: string) => Promise<void>
      getLanguage: () => Promise<string>
      backup: {
        create: (fileName: string, data: string, destinationPath?: string) => Promise<string>
        restore: (backupPath: string) => Promise<string>
      }
      system: {
        getDeviceType: () => Promise<'mac' | 'windows' | 'linux'>
      }
      onThemeChanged: (callback: (theme: 'light' | 'dark') => void) => void
    }
  }
}
