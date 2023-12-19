import { useEffect, useRef, useState } from 'react'

import { CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH } from '@/constants'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { showChatBox } from '@/utils'
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

// 参考浏览器F12的交互实现
// 1. 初始宽度取`(屏幕宽度-limitPageWidth)`和`本地缓存的宽度`的最小值
// 2. 每次手动调整宽度后，将宽度存入本地缓存
// 3. 屏幕resize会更新宽度，但是不会设置到本地缓存
// 4. 本地缓存的宽度会在下次打开时使用
const useChatBoxWidth = () => {
  const { sidebarSettings, updateSidebarSettings } = useSidebarSettings()
  const [loaded, setLoaded] = useState<boolean>(false)
  const [visibleWidth, setVisibleWidth] = useState<number>(
    CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
  )
  const [maxWidth, setMaxWidth] = useState<number>(0)
  const setLocalWidth = async (width: number) => {
    setVisibleWidth(width)
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
      setMaxWidth(maxWidth)
    }
    window.addEventListener('resize', resize)
    resize()
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [setMaxWidth])
  useEffect(() => {
    setVisibleWidth(Math.min(maxWidth, visibleWidth))
  }, [maxWidth])
  const onceRef = useRef(false)
  useEffect(() => {
    if (onceRef.current) {
      return
    }
    if (sidebarSettings?.common?.chatBoxWidth && maxWidth) {
      setVisibleWidth(Math.min(maxWidth, sidebarSettings?.common?.chatBoxWidth))
      onceRef.current = true
      setLoaded(true)
    }
  }, [sidebarSettings?.common?.chatBoxWidth, maxWidth])
  return {
    minWidth: CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
    maxWidth,
    resizeEnable: {
      ...RESIZE_ENABLE,
      // 如果是新标签页，不允许左右拖动
      left: !isMaxAIImmersiveChatPage(),
    },
    visibleWidth,
    setLocalWidth,
  }
}
export default useChatBoxWidth
