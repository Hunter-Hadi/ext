import Menu, { MenuProps } from '@mui/material/Menu'
import React, { FC, useEffect, useMemo, useState } from 'react'

import {
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'

type rootContainer = HTMLElement | (() => HTMLElement | undefined)
const MaxAIMenu: FC<
  MenuProps & {
    rootContainer?: rootContainer
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
        top,
        left,
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
    anchorEl,
    disablePortal,
    transformOrigin,
    anchorOrigin,
    menuElement,
    container,
  ])
  // 因为html的 width会影响到mui modal的显示，所以这里需要设置为100%
  const [currentOpen, setCurrentOpen] = useState(false)
  useEffect(() => {
    if (open) {
      document.documentElement.style.width = '100%'
    }
    setCurrentOpen(open)
    return () => {
      isShowChatBox() && showChatBox()
    }
  }, [open])
  return (
    <Menu
      open={currentOpen}
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
