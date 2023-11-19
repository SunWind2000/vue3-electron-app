/// <reference types="vite/client" />
import type { IpcApi } from '@/client/preload' 
import type { webContents } from 'electron'

declare module "*.vue" {
  import { DefineComponent } from "vue"
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    IPC: IpcApi
  }
}
