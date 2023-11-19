import type { WebContents } from 'electron'

export interface CustomWebContents extends WebContents {
  destroy: () => void
}
