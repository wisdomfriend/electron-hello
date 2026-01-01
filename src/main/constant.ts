import { is } from '@electron-toolkit/utils'

export const isDev = is.dev
export const isMac = process.platform === 'darwin'
export const isWin = process.platform === 'win32'
export const isLinux = process.platform === 'linux'
