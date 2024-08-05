import { useEffect, useRef } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'

import { checkVisibilitySettingIsVisible } from '@/background/utils/buttonSettings'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { IVisibilitySetting } from '@/background/utils/chromeExtensionStorage/type'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { FloatingImageMiniMenuState } from '@/features/contextMenu/store'
import { AppDBStorageState, AppLocalStorageState } from '@/store'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

export const FloatingImageMiniMenuStaticData = {
  disable: false,
  lastHoverImage: undefined as HTMLImageElement | undefined,
  currentHoverImage: null as HTMLImageElement | null,
  mouseInImage: false,
  mouseInMenu: false,
  visibility: undefined as IVisibilitySetting | undefined,
}

export const useShowFloatingImageMinMenu = () => {
  const [menu, setMenu] = useRecoilState(FloatingImageMiniMenuState)

  const showMenu = () => {
    setMenu((prevState) => {
      return {
        ...prevState,
        show: true,
      }
    })
  }
  const hideMenu = () => {
    setMenu((prevState) => {
      return {
        ...prevState,
        show: false,
      }
    })
  }

  return {
    showMenu,
    hideMenu,
    menu,
  }
}

export const useUpdateAppSettings = () => {
  const [appDBStorage, setAppDBStorage] = useRecoilState(AppDBStorageState)
  const setAppLocalStorage = useSetRecoilState(AppLocalStorageState)

  const updateAppSettings = async () => {
    const liteChromeExtensionDBStorage =
      await clientGetLiteChromeExtensionDBStorage()
    if (liteChromeExtensionDBStorage) {
      setAppDBStorage({
        ...liteChromeExtensionDBStorage,
      })
      // log.info('get db settings', liteChromeExtensionDBStorage)
    }
    const chromeExtensionLocalStorage = await getChromeExtensionLocalStorage()
    if (chromeExtensionLocalStorage) {
      setAppLocalStorage({
        ...chromeExtensionLocalStorage,
      })
      // log.info('get local settings', chromeExtensionLocalStorage)
    }
  }

  return {
    updateAppSettings,
  }
}

const useFloatingImageMiniMenu = () => {
  const setMenu = useSetRecoilState(FloatingImageMiniMenuState)
  const { showMenu, hideMenu } = useShowFloatingImageMinMenu()

  const [appDBStorage, setAppDBStorage] = useRecoilState(AppDBStorageState)
  const { updateAppSettings } = useUpdateAppSettings()
  const currentVisibility = useRef<IVisibilitySetting>()

  useEffect(() => {
    currentVisibility.current = appDBStorage.floatingImageMiniMenu?.visibility
  }, [appDBStorage.floatingImageMiniMenu])

  const timerHide = useRef<ReturnType<typeof setTimeout> | null>(null)
  const host = useRef<string>('')
  useEffectOnce(() => {
    host.current = getCurrentDomainHost()
  })
  // 网页滚动时，也重新定位
  const handleWindowScroll = () => {
    // console.log("handleWindowScroll")
    calcComponentPositionByImage(
      FloatingImageMiniMenuStaticData.currentHoverImage,
    )
  }
  /**
   * 根据图片计算 Menu 位置
   * @param img
   */
  const calcComponentPositionByImage = (img?: HTMLImageElement | null) => {
    if (!img) {
      return
    }
    const rect = img.getBoundingClientRect()
    // console.log('img rect: ', rect)
    setMenu((prevState) => {
      return {
        ...prevState,
        position: {
          top: rect.top + 'px',
          left: rect.left + 'px',
        },
      }
    })
  }

  const handleMouseEnterImage = (img: HTMLImageElement) => {
    if (
      FloatingImageMiniMenuStaticData.lastHoverImage === img ||
      FloatingImageMiniMenuStaticData.disable ||
      currentVisibility.current?.isWhitelistMode ||
      (currentVisibility.current &&
        !checkVisibilitySettingIsVisible(
          host.current,
          currentVisibility.current,
        ))
    ) {
      return
    }
    // img.style.border = '1px solid red'
    timerHide.current && clearTimeout(timerHide.current)
    window.removeEventListener('scroll', handleWindowScroll)
    FloatingImageMiniMenuStaticData.currentHoverImage = img
    FloatingImageMiniMenuStaticData.lastHoverImage = img
    FloatingImageMiniMenuStaticData.mouseInImage = true
    showMenu()
    calcComponentPositionByImage(img)

    window.addEventListener('scroll', handleWindowScroll)
  }

  const handleMouseLeaveImage = () => {
    if (!FloatingImageMiniMenuStaticData.mouseInImage) {
      return
    }
    // console.log('离开图片')
    delete FloatingImageMiniMenuStaticData.lastHoverImage
    FloatingImageMiniMenuStaticData.mouseInImage = false
    timerHide.current && clearTimeout(timerHide.current)
    timerHide.current = setTimeout(() => {
      if (!FloatingImageMiniMenuStaticData.mouseInMenu) {
        hideMenu()
        window.removeEventListener('scroll', handleWindowScroll)
      }
    }, 50)
  }

  useEffect(() => {
    const stopList: (() => void)[] = []

    document.body.addEventListener(
      'mousemove',
      function handleMousemove(event) {
        const target = event.target as HTMLElement
        // console.log(`body mousemove`, target.tagName);
        // 标签为li标签 而且 父元素为ul

        if (target.tagName === 'IMG') {
          handleMouseEnterImage(target as HTMLImageElement)
        } else {
          handleMouseLeaveImage()
        }

        stopList.push(() => {
          document.body.removeEventListener('mousemove', handleMousemove)
        })
      },
    )

    updateAppSettings()
    document.addEventListener(
      'visibilitychange',
      function handleVisibilitychange() {
        if (document.visibilityState === 'visible') {
          updateAppSettings()
          stopList.push(() => {
            document.removeEventListener(
              'visibilitychange',
              handleVisibilitychange,
            )
          })
        }
      },
    )

    return () => {
      stopList.forEach((stop) => stop())
    }
  }, [])

  return {
    host,
  }
}

export default useFloatingImageMiniMenu
