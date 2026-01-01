import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, ipcMain } from 'electron'
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer'

import { registerIpc } from './ipc'
import { configManager } from './services/ConfigManager'
import { windowService } from './services/WindowService'

// 检查单实例锁
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
} else {
  app.whenReady().then(async () => {
    // 设置应用用户模型 ID
    electronApp.setAppUserModelId('com.electron.hello')

    // 创建主窗口
    const mainWindow = windowService.createMainWindow()

    // 注册 IPC 处理器
    registerIpc(mainWindow, app)

    // 开发环境安装 Redux DevTools
    if (process.env.NODE_ENV === 'development') {
      installExtension(REDUX_DEVTOOLS)
        .then(name => console.log(`Added Extension: ${name}`))
        .catch(err => console.log('An error occurred: ', err))
    }

    // 系统信息 IPC
    ipcMain.handle('system:getDeviceType', () => {
      return process.platform === 'darwin'
        ? 'mac'
        : process.platform === 'win32'
          ? 'windows'
          : 'linux'
    })
  })

  // 监听第二个实例
  app.on('second-instance', () => {
    windowService.showMainWindow()
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('before-quit', async () => {
    app.isQuitting = true
  })
}
