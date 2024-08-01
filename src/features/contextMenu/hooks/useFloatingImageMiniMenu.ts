import { useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil'

import { FloatingImageMiniMenuState } from '@/features/contextMenu/store'

export const FloatingImageMiniMenuStaticData = {
  currentHoverImage: null as HTMLImageElement | null,
  mouseInImage: false,
  mouseInMenu: false,
}

const useFloatingImageMiniMenu = () => {
  const setMenu = useSetRecoilState(FloatingImageMiniMenuState)

  const timerHide = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * 根据图片计算 Menu 位置
   * @param img
   */
  const calcComponentPositionByImage = (img: HTMLImageElement) => {
    const rect = img.getBoundingClientRect()
    // console.log('img rect: ', rect)
    setMenu((prevState) => {
      return {
        ...prevState,
        position: {
          top: rect.bottom + 'px',
          left: rect.left + 'px',
        },
      }
    })
  }

  useEffect(() => {
    const stopList: (() => void)[] = []

    // 遍历页面上的所有图片元素
    Array.from(document.querySelectorAll('img')).forEach((img) => {
      const handleMouseEnterImage = () => {
        timerHide.current && clearTimeout(timerHide.current)
        window.removeEventListener('scroll', handleWindowScroll)
        FloatingImageMiniMenuStaticData.currentHoverImage = img
        FloatingImageMiniMenuStaticData.mouseInImage = true
        setMenu((prevState) => {
          return {
            ...prevState,
            show: true,
          }
        })
        calcComponentPositionByImage(img)

        window.addEventListener('scroll', handleWindowScroll)
      }

      const handleMouseLeaveImage = () => {
        FloatingImageMiniMenuStaticData.mouseInImage = false
        timerHide.current && clearTimeout(timerHide.current)
        timerHide.current = setTimeout(() => {
          if (!FloatingImageMiniMenuStaticData.mouseInMenu) {
            setMenu((prevState) => {
              return {
                ...prevState,
                show: false,
              }
            })
          }
          window.removeEventListener('scroll', handleWindowScroll)
        }, 50)
      }

      // 网页滚动时，也重新定位
      const handleWindowScroll = () => {
        // console.log("handleWindowScroll")
        calcComponentPositionByImage(img)
      }

      // 鼠标进入图片
      img.addEventListener('mouseenter', handleMouseEnterImage)
      stopList.push(() =>
        img.removeEventListener('mouseenter', handleMouseEnterImage),
      )

      // 鼠标离开图片
      img.addEventListener('mouseleave', handleMouseLeaveImage)
      stopList.push(() =>
        img.removeEventListener('mouseleave', handleMouseEnterImage),
      )

      stopList.push(() =>
        window.removeEventListener('scroll', handleWindowScroll),
      )
    })

    return () => {
      stopList.forEach((stop) => stop())
    }
  }, [])
}

export default useFloatingImageMiniMenu
