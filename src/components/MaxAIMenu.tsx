import Menu, { MenuProps } from '@mui/material/Menu'
import React, { FC, useMemo, useState } from 'react'

import { getMaxAIFloatingContextMenuRootElement } from '@/utils'

type rootContainer = HTMLElement | (() => HTMLElement | undefined)
const MaxAIMenu: FC<
  MenuProps & {
    rootContainer?: rootContainer
  }
> = (props) => {
  const [menuElement, setMenuElement] = useState<HTMLElement | null>(null)
  const {
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
  return (
    <Menu
      {...rest}
      {...memoMenuProps}
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
