import { BrowserView, BrowserWindow, HandlerDetails } from 'electron'
import {
  ClientConfig,
  logger,
  IpcMsg,
  generateId,
  hash
} from '../utils'

import type { TabItem, CustomWebContents } from '../types'

interface TabViewItem extends TabItem {
  view: BrowserView
}

class TabManager {
  private activeTab: TabViewItem | null = null
  private tabList: TabViewItem[] = []
  private parentWindow: BrowserWindow

  constructor (window: BrowserWindow) {
    this.parentWindow = window
  }

  public async add(tab: TabItem) {
    const view = new BrowserView({
      webPreferences: {
        javascript: true,
        nodeIntegration: false,
        contextIsolation: true
      }
    })
    view.setAutoResize({
      width: true,
      height: true
    })
    const nextTab = {
      ...tab,
      view
    }
    this.setAsTopView(nextTab)
    this.navigateHandler(view)
    this.tabList.push(nextTab)
    // 给渲染进程发消息，刷新当前活动标签页
    const data = {
      created: true,
      nextTab: tab
    }
    this.parentWindow.webContents.send(IpcMsg.TabCreate, JSON.stringify(data))
    logger('TabManager', `create new tab:${tab.key} success!`)

    await view.webContents.loadURL(tab.url || 'https://www.baidu.com')
    return true
  }

  public switchTo(tab: TabItem) {
    const viewIndex = this.tabList.findIndex(item => item.id === tab.id)
    if (viewIndex === -1) {
      logger('TabManager', `switch to tab:${tab.key} failed.Tab not found!`, 'error')
      return false
    }
    this.setAsTopView(this.tabList[viewIndex])
    // 给渲染进程发消息，刷新当前活动标签页
    const data = {
      switched: true,
      nextTab: tab
    }
    this.parentWindow.webContents.send(IpcMsg.TabSwitch, JSON.stringify(data))
    logger('TabManager', `switch to tab:${tab.key} success!`)
    return true
  }

  public destroy(tab: TabItem) {
    const viewIndex = this.tabList.findIndex(item => item.id === tab.id)
    const activeViewIndex = this.tabList.findIndex(item => {
      return item.id === this.activeTab?.id
    })
    if (viewIndex === -1) {
      logger('TabManager', `destroy tab:${tab.key} failed.Tab not found!`, 'error')
      return false
    }
    const nextViewIndex = viewIndex <= activeViewIndex
      ? viewIndex - 1
      : activeViewIndex
    
    this.setAsTopView(this.tabList[nextViewIndex])
    // 给渲染进程发消息，刷新当前活动标签页
    const data = {
      closed: true,
      nextTab: this.tabList[nextViewIndex],
      closedTab: tab
    }
    this.parentWindow.webContents.send(IpcMsg.TabClose, JSON.stringify(data))
    logger('TabManager', `destroy tab:${tab.key} success!`)
    // 结束此标签页的进程
    // Electron 类型中没声明destroy函数，但是实际调用生效
    ;(this.tabList[viewIndex].view.webContents as CustomWebContents).destroy()
    this.tabList.splice(viewIndex, 1)
  }

  public openDevTools() {
    this.activeTab?.view.webContents.openDevTools({
      mode: 'detach'
    })
  }

  public reload() {
    this.activeTab?.view.webContents.reload()
  }

  private setAsTopView(nextTab: TabViewItem) {
    if (this.activeTab !== null) {
      this.parentWindow.removeBrowserView(this.activeTab.view)
    }
    this.parentWindow.addBrowserView(nextTab.view)
    this.parentWindow.setTopBrowserView(nextTab.view)
    this.activeTab = nextTab
    this.resetViewSize()
  }

  private resetViewSize() {
    const { width, height } = this.parentWindow.getBounds()
    this.activeTab?.view.setBounds({
      x: 0,
      y: ClientConfig.HeadHeight,
      width,
      height
    })
  }

  private navigateHandler(view: BrowserView) {
    view.webContents.setWindowOpenHandler((details: HandlerDetails) => {
      const tabKey = `new-tab-${generateId()}`
      const tab: TabItem = {
        name: details.frameName || '新建标签页',
        key: tabKey,
        id: hash(tabKey),
        icon: 'logo.svg',
        url: details.url
      }
      this.add(tab)
      return { action: 'deny' }
    })
  }
}

export { TabManager }