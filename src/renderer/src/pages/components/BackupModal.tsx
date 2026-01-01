import React, { useState } from 'react'
import { Modal, Button, message, Upload, Space } from 'antd'
import { CloudUploadOutlined, CloudDownloadOutlined } from '@ant-design/icons'
import { useAppSelector } from '@renderer/store'
import db from '@renderer/databases'
import type { UploadFile } from 'antd/es/upload/interface'

interface BackupModalProps {
  visible: boolean
  onCancel: () => void
  onBackup: () => void
}

const BackupModal: React.FC<BackupModalProps> = ({ visible, onCancel, onBackup }) => {
  const { books } = useAppSelector(state => state.books)
  const [loading, setLoading] = useState(false)

  // 创建备份
  const handleBackup = async () => {
    setLoading(true)
    try {
      // 获取所有数据
      const allBooks = await db.books.toArray()
      const allSettings = await db.settings.toArray()

      // 获取 localStorage 数据
      const localStorageData: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          localStorageData[key] = localStorage.getItem(key) || ''
        }
      }

      const backupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        indexedDB: {
          books: allBooks,
          settings: allSettings
        },
        localStorage: localStorageData
      }

      const dataString = JSON.stringify(backupData, null, 2)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `backup-${timestamp}.zip`

      await window.api.backup.create(fileName, dataString)
      message.success('备份成功')
      onCancel()
    } catch (error) {
      message.error('备份失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 恢复备份
  const handleRestore = async (file: File) => {
    setLoading(true)
    try {
      // 读取文件内容
      const text = await file.text()
      const backupData = JSON.parse(text)

      if (backupData.version !== 1) {
        message.error('不支持的备份文件格式')
        return
      }

      // 恢复 IndexedDB
      if (backupData.indexedDB) {
        if (backupData.indexedDB.books) {
          await db.books.clear()
          if (backupData.indexedDB.books.length > 0) {
            await db.books.bulkAdd(backupData.indexedDB.books)
          }
        }
        if (backupData.indexedDB.settings) {
          await db.settings.clear()
          if (backupData.indexedDB.settings.length > 0) {
            await db.settings.bulkAdd(backupData.indexedDB.settings)
          }
        }
      }

      // 恢复 localStorage
      if (backupData.localStorage) {
        for (const [key, value] of Object.entries(backupData.localStorage)) {
          localStorage.setItem(key, value as string)
        }
      }

      message.success('恢复成功，应用将重新加载')
      setTimeout(() => {
        window.api.reload()
      }, 1000)
    } catch (error) {
      message.error('恢复失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const uploadProps = {
    beforeUpload: (file: File) => {
      handleRestore(file)
      return false
    },
    showUploadList: false
  }

  return (
    <Modal title="数据备份与恢复" open={visible} onCancel={onCancel} footer={null} width={500}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <h3>创建备份</h3>
          <p>将当前所有数据备份到本地文件</p>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={handleBackup}
            loading={loading}
            block
          >
            创建备份
          </Button>
        </div>
        <div>
          <h3>恢复备份</h3>
          <p>从备份文件恢复数据（将覆盖当前数据）</p>
          <Upload {...uploadProps}>
            <Button icon={<CloudDownloadOutlined />} loading={loading} block>
              选择备份文件
            </Button>
          </Upload>
        </div>
      </Space>
    </Modal>
  )
}

export default BackupModal
