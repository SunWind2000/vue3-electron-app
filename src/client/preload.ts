/**
 * preload.ts
 */
import { IpcRendererEvent, contextBridge } from 'electron'
import { IpcRenderManager } from './ipc'
import { IpcMsg } from '../utils'

import type { TabItem } from '../types'

// IPC通信模块
const ipcApi = {
  createTab: (tab: TabItem) => IpcRenderManager.send(IpcMsg.TabCreate, tab),
  switchTab: (tab: TabItem) => IpcRenderManager.send(IpcMsg.TabSwitch, tab),
  closeTab: (tab: TabItem) => IpcRenderManager.send(IpcMsg.TabClose, tab),
  minimizeWindow: () => IpcRenderManager.send(IpcMsg.WindowMinimize),
  maximizeWindow: () => IpcRenderManager.send(IpcMsg.WindowMaximize),
  closeWindow: () => IpcRenderManager.send(IpcMsg.WindowClose),
  flushWindow: () => IpcRenderManager.send(IpcMsg.WindowFlush),
  on: (
    msgName: IpcMsg,
    callback: (evt: IpcRendererEvent, data: string) => void
  ) => IpcRenderManager.on(msgName, callback)
}

export type IpcApi = typeof ipcApi

contextBridge.exposeInMainWorld('IPC', ipcApi)
