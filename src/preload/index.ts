import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// 自定义 API
const api = {
  getAppInfo: () => ipcRenderer.invoke('app:info'),
  reload: () => ipcRenderer.invoke('app:reload'),
  restart: () => ipcRenderer.invoke('app:restart'),
  openWebsite: (url: string) => ipcRenderer.invoke('open:website', url),
  setTheme: (theme: 'light' | 'dark') => ipcRenderer.invoke('app:set-theme', theme),
  getTheme: () => ipcRenderer.invoke('app:get-theme'),
  setLanguage: (lang: string) => ipcRenderer.invoke('app:set-language', lang),
  getLanguage: () => ipcRenderer.invoke('app:get-language'),
  backup: {
    create: (fileName: string, data: string, destinationPath?: string) =>
      ipcRenderer.invoke('backup:create', fileName, data, destinationPath),
    restore: (backupPath: string) => ipcRenderer.invoke('backup:restore', backupPath)
  },
  system: {
    getDeviceType: () => ipcRenderer.invoke('system:getDeviceType')
  },
  onThemeChanged: (callback: (theme: 'light' | 'dark') => void) => {
    ipcRenderer.on('theme-changed', (_, theme) => callback(theme))
  }
}

// 使用 contextBridge 安全地暴露 API
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
