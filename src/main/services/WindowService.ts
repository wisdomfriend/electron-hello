import { is } from '@electron-toolkit/utils'
import { isDev, isLinux, isMac } from '@main/constant'
import { app, BrowserWindow } from 'electron'
import windowStateKeeper from 'electron-window-state'
import { join } from 'path'

import icon from '../../../build/icon.png?asset'
import { configManager } from './ConfigManager'

export class WindowService {
  private static instance: WindowService | null = null
  private mainWindow: BrowserWindow | null = null

  public static getInstance(): WindowService {
    if (!WindowService.instance) {
      WindowService.instance = new WindowService()
    }
    return WindowService.instance
  }

  public createMainWindow(): BrowserWindow {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.show()
      return this.mainWindow
    }

    const mainWindowState = windowStateKeeper({
      defaultWidth: 1200,
      defaultHeight: 800
    })

    const theme = configManager.getTheme()

    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 800,
      minHeight: 600,
      show: false,
      autoHideMenuBar: true,
      backgroundColor: theme === 'dark' ? '#181818' : '#FFFFFF',
      titleBarStyle: isLinux ? 'default' : 'hidden',
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        webSecurity: false,
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    mainWindowState.manage(this.mainWindow)

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    // 开发环境加载开发服务器，生产环境加载构建文件
    if (isDev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return this.mainWindow
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  public showMainWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore()
      }
      this.mainWindow.show()
      this.mainWindow.focus()
    } else {
      this.createMainWindow()
    }
  }
}

export const windowService = WindowService.getInstance()
