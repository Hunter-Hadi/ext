import { useState, useEffect } from 'react'

interface WindowSize {
  width: number | undefined
  height: number | undefined
  scrollHeight: number | undefined
  scrollWidth: number | undefined
}

const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
    scrollHeight: undefined,
    scrollWidth: undefined,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        scrollHeight: document.body.scrollHeight,
        scrollWidth: document.body.scrollWidth,
      })
    }

    // 初次加载时获取窗口尺寸
    handleResize()

    // 监听窗口尺寸变化
    window.addEventListener('resize', handleResize)

    // 组件卸载时移除事件监听
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return windowSize
}

export default useWindowSize
