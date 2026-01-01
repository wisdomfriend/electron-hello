import { app, BrowserWindow, ipcMain, shell } from 'electron'
import Logger from 'electron-log'
import { getFilesDir } from './utils/file'
import { configManager } from './services/ConfigManager'
import { backupManager } from './services/BackupManager'

export function registerIpc(mainWindow: BrowserWindow, app: Electron.App) {
  // 应用信息
  ipcMain.handle('app:info', () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    appPath: app.getAppPath(),
    filesPath: getFilesDir(),
    appDataPath: app.getPath('userData')
  }))

  // 应用控制
  ipcMain.handle('app:reload', () => mainWindow.reload())
  ipcMain.handle('app:restart', () => {
    app.relaunch()
    app.exit()
  })
  ipcMain.handle('open:website', (_, url: string) => shell.openExternal(url))

  // 配置管理
  ipcMain.handle('app:get-theme', () => configManager.getTheme())
  ipcMain.handle('app:set-theme', (_, theme: 'light' | 'dark') => {
    configManager.setTheme(theme)
    mainWindow.webContents.send('theme-changed', theme)
  })

  ipcMain.handle('app:get-language', () => configManager.getLanguage())
  ipcMain.handle('app:set-language', (_, language: string) => {
    configManager.setLanguage(language)
  })

  // 备份和恢复
  ipcMain.handle(
    'backup:create',
    async (_, fileName: string, data: string, destinationPath?: string) => {
      return await backupManager.backup(_, fileName, data, destinationPath)
    }
  )

  ipcMain.handle('backup:restore', async (_, backupPath: string) => {
    return await backupManager.restore(_, backupPath)
  })

  // 日志
  Logger.transports.file.level = 'info'
  Logger.transports.console.level = 'debug'
}
