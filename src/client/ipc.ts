import { ipcRenderer, ipcMain } from 'electron'

import { IpcMsg } from '@/utils/constants'
import type { IpcMainEvent, IpcRendererEvent } from 'electron'

export class IpcMainManager {
  static on (msgName: IpcMsg, callback: (
    event: IpcMainEvent,
    data: string
  ) => void) {
    ipcMain.on(msgName, callback)
  }
}

export class IpcRenderManager {
  static on (msgName: IpcMsg, callback: (
    event: IpcRendererEvent,
    data: string
  ) => void) {
    ipcRenderer.on(msgName, callback)
  }

  static send (msgName: IpcMsg, ...args: unknown[]) {
    const data = args.length ? args : []
    ipcRenderer.send(msgName, JSON.stringify(data))
  }
}
