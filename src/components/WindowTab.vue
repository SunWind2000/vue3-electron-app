<template>
  <div class="window-tab-bar">
    <div class="left">
      <div
        v-for="tabItem in tabList"
        :key="tabItem.key"
        class="tab-item"
        :class="{
          'home-button': tabItem.key === 'home',
          'is-active': tabItem.key === activeTab?.key
        }"
        @click="onSwitchTab(tabItem)"
      >
        <img
          :src="getAssetsFile(`img/window/${tabItem.icon}`)"
          draggable="false"
          class="tab-item__icon"
        >
        <span
          v-if="tabItem.name && tabItem.key !== 'home'"
          class="tab-item__title"
        >
          {{ tabItem.name }}
        </span>
        <span
          v-if="tabItem.key !== 'home'"
          class="tab-item__closeBtn"
          @click.stop="onCloseTab(tabItem)"
        >
          <img src="@/assets/img/window/close.svg" draggable="false">
        </span>
        <div v-if="tabItem.key !== activeTab?.key" class="tab-item__border" />
      </div>
      <div class="tab-create-button short-button" @click="onAddTab">
        <img src="@/assets/img/window/add.svg" draggable="false">
      </div>
    </div>
    <div class="right">
      <div
        v-for="item in windowButtons"
        :key="item.key"
        :title="item.title"
        class="window-button"
        :class="{'is-close': item.key === IpcMsg.WindowClose}"
        @click="onClickWindowButton(item)"
      >
        <img :src="getAssetsFile(`img/window/${item.icon}`)" draggable="false">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, onMounted } from 'vue'
import { generateId, hash, IpcMsg } from '@/utils'
import { usePublic } from '@/hooks'

import type { TabItem } from '@/types'

interface WindowBtn {
  title: string,
  icon: string,
  key: string
}

const { getAssetsFile } = usePublic()

const tabList = ref<TabItem[]>([])
const activeTab = ref<TabItem>()
const windowButtons = ref<WindowBtn[]>([
  { title: '刷新客户端', icon: 'refresh.svg', key: IpcMsg.WindowFlush },
  { title: '窗口最小化', icon: 'minimize.svg', key: IpcMsg.WindowMinimize },
  { title: '窗口最大化', icon: 'maximize.svg', key: IpcMsg.WindowMaximize },
  { title: '关闭窗口', icon: 'close.svg', key: IpcMsg.WindowClose }
])

const onAddTab = () => {
  if (tabList.value.length > 15) return
  const tabKey = `new-tab-${generateId()}`
  const tabId = hash(tabKey)
  const tabItem: TabItem = {
    name: '新建标签页',
    icon: 'logo.svg',
    key: tabKey,
    id: tabId
  }
  window.IPC.createTab(tabItem)
}

const onCloseTab = (tabItem: TabItem) => {
  window.IPC.closeTab(toRaw(tabItem))
}

const onSwitchTab = (tabItem: TabItem) => {
  if (activeTab.value?.key === tabItem.key) return
  window.IPC.switchTab(toRaw(tabItem))
}

const onClickWindowButton = (item: WindowBtn) => {
  const windowBtnRaw = toRaw(item)
  switch (windowBtnRaw.key) {
    case IpcMsg.WindowFlush:
      window.IPC.flushWindow()
      break
    case IpcMsg.WindowMinimize:
      window.IPC.minimizeWindow()
      break
    case IpcMsg.WindowMaximize:
      window.IPC.maximizeWindow()
      break
    case IpcMsg.WindowClose:
      window.IPC.closeWindow()
      break
    default: break
  }
}

// 事件完成后的通知消息，收到通知后进行渲染进程的回调
const ipcMsgHandler = () => {
  window.IPC.on(IpcMsg.TabCreate, (_evt, data: string) => {
    const json = JSON.parse(data)
    if (json.created) {
      tabList.value.push(json.nextTab)
      activeTab.value = json.nextTab
    }
  })
  window.IPC.on(IpcMsg.TabClose, (_evt, data: string) => {
    const json = JSON.parse(data)
    if (json.closed) {
      const index = tabList.value.findIndex(item => {
        return item.key === json.closedTab.key
      })
      tabList.value.splice(index, 1)
      activeTab.value = json.nextTab
    }
  })
  window.IPC.on(IpcMsg.TabSwitch, (_evt, data: string) => {
    const json = JSON.parse(data)
    if (json.switched) {
      activeTab.value = json.nextTab 
    }
  })
  window.IPC.on(IpcMsg.WindowMaximize, (_evt, data: string) => {
    const json = JSON.parse(data)
    const maximizeButtonIndex = windowButtons.value.findIndex(btn => {
      return btn.key === IpcMsg.WindowMaximize
    })
    windowButtons.value[maximizeButtonIndex].icon = json.isMaximized
      ? 'restore.svg'
      : 'maximize.svg'
  })
}

onMounted(() => {
  ipcMsgHandler()
})
</script>

<style lang="less" scoped>
@--window-tab-container-height: 40px;
@--window-tab-height: 32px;
@--window-button-height: 40px;
.window-tab-bar {
  width: 100vw;
  height: @--window-tab-container-height;
  background-color: var(--gray-7);
  user-select: none;
  -webkit-app-region: drag;
}
.left {
  float: left;
  display: flex;
  align-items: center;
  width: 70%;
  max-width: 70%;
  > * {
    position: relative;
    height: @--window-tab-height;
    margin-top: @--window-tab-container-height - @--window-tab-height;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px 4px 0 0;
    -webkit-app-region: no-drag;
    z-index: 1;
    &:hover {
      z-index: 2;
      background-color: var(--gray-6);
    }
    &:active {
      background-color: var(--gray-5);
    }
    &.is-active {
      z-index: 3;
      background-color: var(--white);
      box-shadow: 0px 1px 5px 1px var(--gray-5);
    }
  }
  .tab-item {
    width: 176px;
    max-width: 40%;
    min-width: 45px;
    justify-content: space-between;
    &__icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      object-fit: contain;
      margin-left: 8px;
    }
    &__title {
      flex: 1;
      color: var(--gray-2);
      font-size: 12px;
      width: 60%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      margin-left: 8px;
    }
    &__closeBtn {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      line-height: 16px;
      float: right;
      margin-right: 8px;
      cursor: pointer;
      .set-svg-img-color(var(--gray-3));
      img {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }
      &:hover {
        .set-svg-img-color(var(--gray-2));
      }
    }
    &__border {
      position: absolute;
      right: 0;
      width: 1px;
      height: @--window-tab-height - 8px;
      background-color: var(--gray-5);
      transform: translateX(2px);
      margin-right: 1px;
    }
  }
  .home-button {
    width: 50px;
    height: 32px;
    min-width: 40px;
    justify-content: center;
    img {
      width: 20px;
      height: 20px;
      margin: 0;
    }
  }
  .tab-create-button {
    width: 32px;
    height: 32px;
    min-width: 32px;
    img {
      width: 20px;
      height: 20px;
    }
  }
}
.right {
  float: right;
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
  .window-button {
    width: @--window-button-height;
    height: @--window-button-height;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .set-svg-img-color(var(--gray-3));
    img {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }
    &:hover {
      background-color: var(--gray-6);
    }
    &:active {
      background-color: var(--gray-5);
    }
    &.is-close:hover {
      background-color: var(--red-7);
      .set-svg-img-color(var(--white));
    }
  }
}
</style>
