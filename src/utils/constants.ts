import { hash } from './util'

/**
 * @description 主进程和渲染进程之间的通信消息类型枚举
 */
export enum IpcMsg {
  // 窗体相关
  WindowClose = 'window:close',
  WindowMinimize = 'window:minimize',
  WindowMaximize = 'window:maximize',
  WindowFlush = 'window.flush',
  // 标签页相关
  TabCreate = 'tab:create',
  TabSwitch = 'tab:switch',
  TabClose = 'tab:close',
  // 全局配置
  ThemeSwitch = 'global:theme:switch'
}

/**
 * @description 窗体配置
 */
export const ClientConfig = {
  Width: 1440,
  Height: 810,
  HeadHeight: 40,
  ViewHeight: 770
}

/**
 * @description 是否是生产环境
 */
export const isProduction = process.env.NODE_ENV === 'production'

export const HOME_TAB = {
  key: 'home',
  name: '首页',
  icon: 'home.svg',
  id: hash('home')
}
