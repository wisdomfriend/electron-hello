import { app } from 'electron'
import path from 'path'

export function getFilesDir(): string {
  return path.join(app.getPath('userData'), 'files')
}
