import { useEffect, useRef, useState } from 'react'
import { atom, useRecoilState, useRecoilValue } from 'recoil'

import { CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH } from '@/constants'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const RESIZE_ENABLE = {
  top: false,
  right: false,
  bottom: false,
  left: true,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
}

const limitPageWidth = 150

// 为了 可以在不同组件中获取到当前 sidebar，需要把 sidebar styles 保存在 recoil 中
const SidebarStylesAtom = atom({
  key: 'SidebarStylesAtom',
  default: {
    minWidth: CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
    visibleWidth: CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
    maxWidth: 0,
  },
})

// 参考浏览器F12的交互实现
// 1. 初始宽度取`(屏幕宽度-limitPageWidth)`和`本地缓存的宽度`的最小值
// 2. 每次手动调整宽度后，将宽度存入本地缓存
// 3. 屏幕resize会更新宽度，但是不会设置到本地缓存
// 4. 本地缓存的宽度会在下次打开时使用
const useChatBoxWidth = () => {
  const { sidebarSettings, updateSidebarSettings } = useSidebarSettings()
  const [loaded, setLoaded] = useState<boolean>(false)
  const [sidebarStyles, setSidebarStyles] = useRecoilState(SidebarStylesAtom)
  const { maxWidth } = sidebarStyles
  const setLocalWidth = async (width: number) => {
    setSidebarStyles((pre) => ({
      ...pre,
      visibleWidth: width,
    }))
    if (!loaded) {
      return
    }
    await updateSidebarSettings({
      common: {
        chatBoxWidth: width,
      },
    })
    showChatBox()
  }
  useEffect(() => {
    const resize = () => {
      const maxWidth = Math.max(
        (document.documentElement.clientWidth ||
          document.body.clientWidth ||
          0) - limitPageWidth,
        CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
      )
      setSidebarStyles((pre) => ({
        ...pre,
        maxWidth,
      }))
    }
    window.addEventListener('resize', resize)
    resize()
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])
  useEffect(() => {
    setSidebarStyles((pre) => ({
      ...pre,
      visibleWidth: Math.min(pre.visibleWidth, maxWidth),
    }))
  }, [maxWidth])
  const onceRef = useRef(false)
  useEffect(() => {
    if (onceRef.current) {
      return
    }
    if (sidebarSettings?.common?.chatBoxWidth && maxWidth) {
      setSidebarStyles((pre) => ({
        ...pre,
        visibleWidth: Math.min(
          maxWidth,
          sidebarSettings?.common?.chatBoxWidth ?? pre.minWidth,
        ),
      }))
      onceRef.current = true
      setLoaded(true)
    }
  }, [sidebarSettings?.common?.chatBoxWidth, maxWidth])
  return {
    loaded,
    minWidth: sidebarStyles.minWidth,
    maxWidth: sidebarStyles.maxWidth,
    resizeEnable: {
      ...RESIZE_ENABLE,
      // 如果是新标签页，不允许左右拖动
      left: !isMaxAIImmersiveChatPage(),
    },
    visibleWidth: sidebarStyles.visibleWidth,
    setLocalWidth,
  }
}

export const useChatBoxStyles = () => {
  return useRecoilValue(SidebarStylesAtom)
}

export default useChatBoxWidth
