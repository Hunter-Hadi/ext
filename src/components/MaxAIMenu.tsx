import Menu, { MenuProps } from '@mui/material/Menu'
import React, { FC, useMemo, useState } from 'react'

import { getMaxAIFloatingContextMenuRootElement } from '@/utils'

type rootContainer = HTMLElement | (() => HTMLElement | undefined)
const MaxAIMenu: FC<
  MenuProps & {
    rootContainer?: rootContainer
    offset?: [number, number]
  }
> = (props) => {
  const [menuElement, setMenuElement] = useState<HTMLElement | null>(null)
  const {
    open,
    anchorEl,
    transformOrigin,
    anchorOrigin,
    container,
    disablePortal,
    rootContainer,
    children,
    offset,
    ...rest
  } = props
  const memoMenuProps: Partial<MenuProps> = useMemo(() => {
    let anchorPosition:
      | {
          top: number
          left: number
        }
      | undefined = undefined
    let targetElement = anchorEl instanceof HTMLElement ? anchorEl : null
    if (typeof anchorEl === 'function') {
      const anchorElResult = anchorEl()
      if (anchorElResult instanceof HTMLElement) {
        targetElement = anchorElResult
      }
    }
    let containerRect = null
    if (rootContainer) {
      if (typeof rootContainer === 'function') {
        containerRect = rootContainer()?.getBoundingClientRect()
      } else {
        containerRect = rootContainer.getBoundingClientRect()
      }
    } else if (menuElement) {
      containerRect =
        menuElement?.parentElement?.parentElement?.getBoundingClientRect()
    }
    const floatingContextMenu = getMaxAIFloatingContextMenuRootElement()
    if (
      targetElement &&
      containerRect &&
      floatingContextMenu?.contains(targetElement)
    ) {
      const targetElementRect = targetElement.getBoundingClientRect()
      const top = targetElementRect.top - containerRect.top
      const left = targetElementRect.left - containerRect.left
      anchorPosition = {
        left: left + (offset ? offset[0] : 0),
        top: top + (offset ? offset[1] : 0),
      }
    }
    const anchorReference = anchorPosition ? 'anchorPosition' : 'anchorEl'
    return {
      anchorEl,
      anchorReference,
      anchorPosition,
      transformOrigin: anchorPosition ? undefined : transformOrigin,
      anchorOrigin: anchorPosition ? undefined : anchorOrigin,
      disablePortal: anchorPosition ? true : disablePortal,
      rootContainer,
    }
  }, [
    offset,
    anchorEl,
    disablePortal,
    transformOrigin,
    anchorOrigin,
    menuElement,
    container,
  ])
  // 因为html的 width会影响到mui modal的显示，所以这里需要设置为100%
  // const [currentOpen, setCurrentOpen] = useState(false)
  // useEffect(() => {
  //   if (open) {
  //     document.documentElement.style.width = '100%'
  //   }
  //   return () => {
  //     isShowChatBox() && showChatBox()
  //   }
  // }, [open])
  return (
    <Menu
      // open={isMaxAIImmersiveChatPage() ? open : currentOpen}
      open={open}
      {...memoMenuProps}
      {...rest}
      component={'div'}
      MenuListProps={{
        ...rest.MenuListProps,
        component: 'div',
        ref: setMenuElement,
      }}
    >
      {children}
    </Menu>
  )
}
export default MaxAIMenu
