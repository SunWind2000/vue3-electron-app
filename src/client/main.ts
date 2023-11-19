import { app, BrowserWindow, Menu } from 'electron'
import path from 'path'
import { ClientConfig, HOME_TAB, IpcMsg } from '../utils'
import { IpcMainManager } from './ipc'
import { TabManager } from './tab-manager'

let tabManager: null | TabManager = null
let mainWindow: null | BrowserWindow = null

// 屏蔽Unsecure HTTP警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

async function createWindow() {
  Menu.setApplicationMenu(null)

  let tabManagerInstance: null | TabManager = null

  const win = new BrowserWindow({
    width: ClientConfig.Width,
    height: ClientConfig.Height,
    minWidth: ClientConfig.Height,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.NODE_ENV !== 'development') {
    await win.loadFile(path.join(__dirname, 'index.html'))
    tabManagerInstance = new TabManager(win)
  } else {
    let url = 'http://localhost:5173'
    await win.loadURL(url)
    tabManagerInstance = new TabManager(win)
    win.webContents.openDevTools({ mode: 'detach' })
  }
  return {
    win,
    tabManagerInstance
  }
}

app.whenReady().then(async() => {
  const { win, tabManagerInstance } = await createWindow()
  mainWindow = win
  tabManager = tabManagerInstance
  tabManager.add(HOME_TAB)
  ipcRenderMsgHandler()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

const ipcRenderMsgHandler = () => {
  IpcMainManager.on(IpcMsg.TabCreate, (_evt, data: string) => {
    const jsonData = JSON.parse(data)
    tabManager?.add(jsonData[0])
  })
  IpcMainManager.on(IpcMsg.TabSwitch, (_evt, data: string) => {
    const jsonData = JSON.parse(data)
    tabManager?.switchTo(jsonData[0])
  })
  IpcMainManager.on(IpcMsg.TabClose, (_evt, data: string) => {
    const jsonData = JSON.parse(data)
    tabManager?.destroy(jsonData[0])
  })
  IpcMainManager.on(IpcMsg.WindowMinimize, () => {
    mainWindow?.minimize()
  })
  IpcMainManager.on(IpcMsg.WindowMaximize, () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.restore()
    } else {
      mainWindow?.maximize()
    }
    mainWindow?.webContents.send(IpcMsg.WindowMaximize, JSON.stringify({
      isMaximized: mainWindow.isMaximized()
    }))
  })
  IpcMainManager.on(IpcMsg.WindowClose, () => {
    mainWindow?.destroy()
  })
  IpcMainManager.on(IpcMsg.WindowFlush, () => {
    tabManager?.reload()
  })
}
