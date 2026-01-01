import { app, ipcMain } from 'electron'
import AdmZip from 'adm-zip'
import fs from 'fs-extra'
import path from 'path'
import Logger from 'electron-log'

class BackupManager {
  private backupDir = path.join(app.getPath('userData'), 'backups')
  private tempDir = path.join(app.getPath('temp'), 'electron-hello-backup')

  constructor() {
    // 确保备份目录存在
    fs.ensureDirSync(this.backupDir)
  }

  async backup(
    _: Electron.IpcMainInvokeEvent,
    fileName: string,
    data: string,
    destinationPath: string = this.backupDir
  ): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupFileName = fileName || `backup-${timestamp}.zip`
      const backupPath = path.join(destinationPath, backupFileName)

      // 创建临时目录
      await fs.ensureDir(this.tempDir)

      // 保存数据到临时文件
      const dataPath = path.join(this.tempDir, 'data.json')
      await fs.writeFile(dataPath, data, 'utf-8')

      // 创建 ZIP 文件
      const zip = new AdmZip()
      zip.addLocalFile(dataPath)
      zip.writeZip(backupPath)

      // 清理临时目录
      await fs.remove(this.tempDir)

      Logger.info(`Backup created: ${backupPath}`)
      return backupPath
    } catch (error) {
      Logger.error('Backup failed:', error)
      throw error
    }
  }

  async restore(_: Electron.IpcMainInvokeEvent, backupPath: string): Promise<string> {
    try {
      // 创建临时目录
      await fs.ensureDir(this.tempDir)

      Logger.log('[BackupManager] step 1: unzip backup file', this.tempDir)
      // 解压备份文件
      const zip = new AdmZip(backupPath)
      zip.extractAllTo(this.tempDir, true)

      Logger.log('[BackupManager] step 2: read data.json')
      // 读取 data.json
      const dataPath = path.join(this.tempDir, 'data.json')
      const data = await fs.readFile(dataPath, 'utf-8')

      // 清理临时目录
      await fs.remove(this.tempDir)

      Logger.info(`Backup restored from: ${backupPath}`)
      return data
    } catch (error) {
      Logger.error('Restore failed:', error)
      throw error
    }
  }
}

export const backupManager = new BackupManager()
