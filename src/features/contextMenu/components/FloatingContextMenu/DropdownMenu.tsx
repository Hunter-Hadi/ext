/**
 * @description menu只能触发左右，不能触发上下，menuitem可以触发上下
 */
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  offset,
  Placement,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
} from '@floating-ui/react'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'

import {
  ContextMenuIcon,
  IContextMenuIconKey,
} from '@/components/ContextMenuIcon'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID } from '@/features/common/constants'
import { FAVORITE_CONTEXT_MENU_GROUP_ID } from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import {
  FloatingDropdownMenuItemsSelector,
  FloatingDropdownMenuSelectedItemState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'

interface LiteDropdownMenuItemProps {
  label?: string
  icon?: IContextMenuIconKey | string
  CustomRenderNode?: React.ReactNode
  isGroup?: boolean
  onClick?: (event: React.MouseEvent) => void
}

interface MenuItemProps {
  label: string
  menuItem: IContextMenuItemWithChildren
  disabled?: boolean
}

// eslint-disable-next-line react/display-name
export const LiteDropdownMenuItem = React.forwardRef<
  any,
  LiteDropdownMenuItemProps
>(({ label, icon, CustomRenderNode, onClick, isGroup, ...props }, ref) => {
  const floatingUiProps: any = props
  return (
    <Box
      {...props}
      sx={{
        boxSizing: 'border-box',
        borderRadius: '3px',
        height: '28px',
        fontSize: '14px',
        width: '100%',
        cursor: 'pointer',
        '&.floating-context-menu-item--active': {
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(55, 53, 47, 0.08)',
          '& .floating-context-menu-item__footer-icon': {
            display: 'flex',
          },
        },
        '& .floating-context-menu-item__footer-icon': {
          display: 'none',
          flexShrink: 0,
        },
        '& .floating-context-menu-item__footer-icon--active': {
          display: 'flex',
        },
        '&:hover': {
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(55, 53, 47, 0.08)',
          '& .floating-context-menu-item__footer-icon': {
            display: 'flex',
          },
        },
      }}
      ref={ref}
      component={'div'}
      role="menuitem"
      onClick={(event: any) => {
        onClick?.(event)
        floatingUiProps?.onClick?.(event)
      }}
    >
      <Box>
        {CustomRenderNode || (
          <Stack direction={'row'} spacing={1} px={1} alignItems={'center'}>
            <ContextMenuIcon
              size={16}
              icon={icon || 'Empty'}
              sx={{ color: 'primary.main', flexShrink: 0 }}
            />
            <Typography
              fontSize={14}
              textAlign={'left'}
              color={'text.primary'}
              width={0}
              noWrap
              flex={1}
              lineHeight={'28px'}
            >
              {label}
            </Typography>
            {isGroup && (
              <KeyboardArrowRightIcon
                sx={{
                  ml: 'auto',
                  mr: 0,
                  flexShrink: 0,
                  color: (t) =>
                    t.palette.mode === 'dark'
                      ? '#ffffff85'
                      : 'rgba(55, 53, 47, 0.45)',
                  fontSize: 16,
                }}
              />
            )}
          </Stack>
        )}
      </Box>
    </Box>
  )
})

// eslint-disable-next-line react/display-name
export const DropdownMenuItem = React.forwardRef<any, MenuItemProps>(
  ({ label, disabled, menuItem, ...props }, ref) => {
    const floatingUiProps: any = props
    const { t } = useTranslation(['prompt'])
    const hoverIds = useRecoilValue(FloatingDropdownMenuItemsSelector)
    const [floatingDropdownMenuSelectedItem, updateSelectedId] = useRecoilState(
      FloatingDropdownMenuSelectedItemState,
    )
    const menuLabel = useMemo(() => {
      const id = menuItem.id.replace(FAVORITE_CONTEXT_MENU_GROUP_ID, '')
      const key: any = `prompt:${id}`
      if (t(key) !== id) {
        return t(key)
      }
      return menuItem.text
    }, [menuItem.text, t])
    const isHover = useMemo(() => {
      return (
        hoverIds.includes(menuItem.id) ||
        menuItem.id === floatingDropdownMenuSelectedItem.lastHoverContextMenuId
      )
    }, [hoverIds, floatingDropdownMenuSelectedItem.lastHoverContextMenuId])
    const isLastHover = useMemo(() => {
      return (
        floatingDropdownMenuSelectedItem.lastHoverContextMenuId ===
          menuItem.id && isHover
      )
    }, [isHover, floatingDropdownMenuSelectedItem.lastHoverContextMenuId])
    return (
      <Box
        {...props}
        data-id={menuItem.id}
        // aria-disabled={disabled}
        className={`floating-context-menu-item ${
          isHover ? 'floating-context-menu-item--active' : ''
        }`}
        tabIndex={isHover ? 0 : -1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 1,
          boxSizing: 'border-box',
          px: 1,
          borderRadius: '3px',
          height: '28px',
          fontSize: '14px',
          width: '100%',
          cursor: 'pointer',
          '&.floating-context-menu-item--active': {
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(55, 53, 47, 0.08)',
            '& .floating-context-menu-item__footer-icon': {
              display: 'flex',
            },
          },
          '& .floating-context-menu-item__footer-icon': {
            display: 'none',
            flexShrink: 0,
          },
          '& .floating-context-menu-item__footer-icon--active': {
            display: 'flex',
          },
          '&:hover': {
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(55, 53, 47, 0.08)',
            '& .floating-context-menu-item__footer-icon': {
              display: 'flex',
            },
          },
        }}
        ref={ref}
        component={'div'}
        role="menuitem"
        onKeyDown={(event: any) => {
          floatingUiProps?.onKeyDown?.(event)
          if (event.code === 'Enter') {
            updateSelectedId((prevState) => {
              return {
                ...prevState,
                selectedContextMenuId: menuItem.id,
              }
            })
            event.stopPropagation()
          }
        }}
        onClick={(event: any) => {
          updateSelectedId((prevState) => {
            return {
              ...prevState,
              selectedContextMenuId: menuItem.id,
            }
          })
          floatingUiProps?.onClick?.(event)
        }}
      >
        {menuItem?.data?.icon && (
          <ContextMenuIcon
            size={16}
            icon={menuItem.data.icon}
            sx={{ color: 'primary.main', flexShrink: 0 }}
          />
        )}
        <Typography
          fontSize={14}
          textAlign={'left'}
          color={'text.primary'}
          width={0}
          noWrap
          flex={1}
          lineHeight={'28px'}
        >
          {menuLabel}
        </Typography>
        <span
          className={
            'floating-context-menu-item__footer-icon ' +
            (menuItem.data.type === 'group'
              ? 'floating-context-menu-item__footer-icon--active'
              : '')
          }
        >
          {menuItem.data.type === 'group' ? (
            <KeyboardArrowRightIcon
              sx={{
                color: (t) =>
                  t.palette.mode === 'dark'
                    ? '#ffffff85'
                    : 'rgba(55, 53, 47, 0.45)',
                fontSize: 16,
              }}
            />
          ) : (
            isLastHover && (
              <KeyboardReturnIcon
                sx={{
                  color: (t) =>
                    t.palette.mode === 'dark'
                      ? '#ffffff85'
                      : 'rgba(55, 53, 47, 0.45)',
                  fontSize: 16,
                }}
              />
            )
          )}
        </span>
      </Box>
    )
  },
)

export interface MenuProps {
  label: string
  nested?: boolean
  children?: React.ReactNode
  root?: HTMLElement
  referenceElement?: React.ReactNode
  referenceElementOpen?: boolean
  customOpen?: boolean
  needAutoUpdate?: boolean
  zIndex?: number
  menuSx?: SxProps
  hoverOpen?: boolean
  defaultPlacement?: Placement
  defaultFallbackPlacements?: Placement[]
  onClickContextMenu?: (contextMenu: IContextMenuItem) => void
  onClickReferenceElement?: (event: React.MouseEvent<any, MouseEvent>) => void
  menuWidth?: number
}

// eslint-disable-next-line react/display-name
export const MenuComponent = React.forwardRef<
  any,
  MenuProps & React.HTMLProps<any>
>(
  (
    {
      referenceElement,
      referenceElementOpen,
      zIndex,
      children,
      label,
      root,
      hoverOpen = true,
      customOpen = false,
      needAutoUpdate = false,
      menuSx,
      defaultPlacement,
      defaultFallbackPlacements,
      onClickContextMenu,
      onClickReferenceElement,
      menuWidth = 400,
      ...props
    },
    forwardedRef,
  ) => {
    const tree = useFloatingTree()
    const nodeId = useFloatingNodeId()
    const parentId = useFloatingParentNodeId()
    const isFirstDeep = !parentId && zIndex === 2147483601
    const [
      floatingDropdownMenuSelectedItem,
      setFloatingDropdownMenuSelectedItem,
    ] = useRecoilState(FloatingDropdownMenuSelectedItemState)
    const isNested = parentId != null
    const [isOpen, setIsOpen] = React.useState(
      customOpen ? referenceElementOpen : false,
    )
    useEffect(() => {
      setTimeout(() => {
        setIsOpen(referenceElementOpen)
      }, 1)
    }, [referenceElementOpen])
    const [activeIndex, setActiveIndex] = React.useState<number | null>(
      isFirstDeep ? 1 : null,
    )
    const floatingDropdownMenu = useRecoilValue(FloatingDropdownMenuState)
    const [allowHover, setAllowHover] = React.useState(false)
    const lastParentDropdownMenuItemRef = useRef<HTMLDivElement | null>(null)
    const lastHoverDropdownMenuItemRef = useRef<HTMLDivElement | null>(null)
    const listItemsRef = React.useRef<Array<any | null>>([])
    const listContentRef = React.useRef(
      React.Children.map(children, (child) =>
        React.isValidElement(child) ? child.props.label : null,
      ) as Array<string | null>,
    )
    const currentPlacement =
      defaultPlacement || (isFirstDeep ? 'bottom-start' : 'right-start')
    const currentFallbackPlacements =
      defaultFallbackPlacements ||
      (isFirstDeep
        ? ['bottom-start', 'top-start', 'right']
        : [
            'right',
            'right-start',
            'right-end',
            'left',
            'left-start',
            'left-end',
          ])
    const resetActiveIndex = () => {
      console.log(`[${nodeId}]onNavigate---[重置]`)
      setActiveIndex(null)
      lastHoverDropdownMenuItemRef.current = null
      lastParentDropdownMenuItemRef.current = null
    }
    const floatingDropdownMenuOpenRef = useRef(floatingDropdownMenu.open)
    useEffect(() => {
      floatingDropdownMenuOpenRef.current = floatingDropdownMenu.open
    }, [floatingDropdownMenu.open])
    const { x, y, strategy, refs, context } = useFloating<any>({
      nodeId,
      open: isOpen,
      onOpenChange: (show) => {
        console.log(nodeId, parentId, 'onNavigateonNavigateonNavigate open')
        if (!show) {
          resetActiveIndex()
        }
        if (customOpen) {
          return
        }
        setIsOpen(show)
      },
      placement: currentPlacement,
      middleware: [
        offset({
          mainAxis: isFirstDeep ? 4 : 0,
          alignmentAxis: isFirstDeep ? 0 : -4,
        }),
        flip({
          fallbackPlacements: currentFallbackPlacements,
        }),
        shift(),
      ],
      whileElementsMounted: needAutoUpdate ? autoUpdate : undefined,
    })
    const hover = useHover(context, {
      enabled: hoverOpen && allowHover,
      delay: { open: 75 },
      handleClose: safePolygon({
        restMs: 25,
        blockPointerEvents: false,
      }),
    })
    const click = useClick(context, {
      event: 'mousedown',
      toggle: !isNested || !allowHover,
      ignoreMouse: isNested,
    })
    const role = useRole(context, { role: 'menu' })
    const dismiss = useDismiss(context)
    // 最后一次按下的键盘事件
    const lastKeydownEvent = useRef<React.KeyboardEvent | null>(null)
    const listNavigation = useListNavigation(context, {
      listRef: listItemsRef,
      activeIndex,
      nested: isNested,
      onNavigate(index) {
        const focusTextarea = () => {
          if (!floatingDropdownMenuOpenRef.current) {
            return
          }
          const textareaEl =
            getMaxAIFloatingContextMenuRootElement()?.querySelector(
              `#${MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID}`,
            ) as HTMLTextAreaElement
          if (textareaEl) {
            textareaEl?.focus()
          }
        }
        const isRootText = !parentId ? '[根级]' : `[子级]`
        const keydownKey = lastKeydownEvent.current?.key
        if (keydownKey) {
          // 是否用户触摸的是contextMenu
          let isHoverContextMenu = false
          let hoverContextMenuItem: FloatingUIDropdownItemDetail | null = null
          if (lastHoverDropdownMenuItemRef.current) {
            isHoverContextMenu = true
            hoverContextMenuItem = getFloatingUIDropdownItemDetail(
              lastHoverDropdownMenuItemRef.current,
            )
          }
          console.log(
            `${isRootText}[${nodeId}]onNavigate---[keydownKey]: ${keydownKey}`,
          )
          // 过滤不是contextMenu的选项
          const contextMenuIdList: Array<{
            floatingUIId?: string
            contextMenuId: string
            contextMenuIndex: number
          }> = []
          listItemsRef.current?.forEach((item, index) => {
            const contextMenuId = item?.getAttribute('data-id')
            if (!contextMenuId) {
              return
            }
            contextMenuIdList.push({
              floatingUIId: item?.id?.replace(/:/g, '\\:') || '',
              contextMenuId,
              contextMenuIndex: index,
            })
          })
          setFloatingDropdownMenuSelectedItem((prev) => {
            let lastHoverContextMenuId =
              prev.hoverContextMenuIdMap[nodeId] ||
              prev.lastHoverContextMenuId ||
              ''
            // 如果是hover的contextMenu, 则使用hover的contextMenuId
            if (isHoverContextMenu && hoverContextMenuItem?.contextMenuId) {
              lastHoverContextMenuId = hoverContextMenuItem.contextMenuId
            }
            let currentIndex = contextMenuIdList.findIndex(
              (item) => item.contextMenuId === lastHoverContextMenuId,
            )
            // 如果按的是左右的方向键
            if (keydownKey === 'ArrowLeft') {
              console.log(`${isRootText}[${nodeId}]onNavigate---[👈关闭]`)
              setActiveIndex(null)
              focusTextarea()
              return {
                ...prev,
                lastHoverContextMenuId: null,
                hoverContextMenuIdMap: {
                  ...prev.hoverContextMenuIdMap,
                  [nodeId]: '',
                },
              }
            }
            if (keydownKey === 'ArrowRight') {
              // 如果有contextMenuItem, 说明向右展开了，设置第一个为active
              if (contextMenuIdList.length > 0) {
                console.log(`${isRootText}[${nodeId}]onNavigate---[👉展开]`)
                const nextContextMenuItem = contextMenuIdList[0]
                setActiveIndex(nextContextMenuItem.contextMenuIndex)
                focusTextarea()
                return {
                  ...prev,
                  lastHoverContextMenuId: nextContextMenuItem.contextMenuId,
                }
              } else {
                console.log(`${isRootText}[${nodeId}]onNavigate---[👉展开失败]`)
                // 如果没有contextMenuItem, 说明向右收起了，设置为null
                setActiveIndex(null)
                focusTextarea()
                return {
                  ...prev,
                  lastHoverContextMenuId: null,
                  hoverContextMenuIdMap: {
                    ...prev.hoverContextMenuIdMap,
                    [nodeId]: '',
                  },
                }
              }
            }
            // 如果按的是上下的方向键
            // 是否是用户按下左方向键回退面板
            let isKeydownArrowLeftBack = false

            const keydownArrowLeftBackSelectItem = lastKeydownEvent.current
              ?.target as HTMLDivElement
            const keydownArrowLeftBackSelectId =
              keydownArrowLeftBackSelectItem?.getAttribute('data-lastid')
            if (keydownArrowLeftBackSelectId) {
              currentIndex = contextMenuIdList.findIndex(
                (item) => item.floatingUIId === keydownArrowLeftBackSelectId,
              )
              keydownArrowLeftBackSelectItem.removeAttribute('data-lastid')
              isKeydownArrowLeftBack = true
            }
            if (currentIndex === -1) {
              // 如果是根节点, 说明list更新了
              if (!parentId) {
                currentIndex = 0
              }
            }
            // console.log(
            //   `${isRootText}[${nodeId}]onNavigate---上下: [currentIndex=${contextMenuIdList?.[currentIndex]?.contextMenuIndex}]\n [index=${index}]`,
            //   contextMenuIdList,
            // )
            if (currentIndex === -1) {
              focusTextarea()
              return prev
            }
            let nextContextMenuItem: {
              contextMenuId: string
              contextMenuIndex: number
            } | null = null
            if (keydownKey === 'ArrowDown') {
              if (isKeydownArrowLeftBack || isHoverContextMenu) {
                // 因为是通过arrow down触发回退的，所以不需要加1
                // 因为是通过hover触发的，所以不需要加1
                nextContextMenuItem = contextMenuIdList[currentIndex]
              } else {
                // 寻找下一个，如果是最后一个，回到开头
                if (contextMenuIdList[currentIndex + 1]) {
                  nextContextMenuItem = contextMenuIdList[currentIndex + 1]
                } else {
                  nextContextMenuItem = contextMenuIdList[0]
                }
              }
            } else if (keydownKey === 'ArrowUp') {
              // 寻找上一个，如果是第一个，回到最后
              if (contextMenuIdList[currentIndex - 1]) {
                nextContextMenuItem = contextMenuIdList[currentIndex - 1]
              } else {
                nextContextMenuItem =
                  contextMenuIdList[contextMenuIdList.length - 1]
              }
            }
            if (nextContextMenuItem) {
              // console.log(
              //   `${isRootText}[${nodeId}]onNavigate---上下: [nextIndex=${nextContextMenuItem.contextMenuIndex}]`,
              // )
              setActiveIndex(nextContextMenuItem.contextMenuIndex)
              focusTextarea()
              return {
                ...prev,
                hoverContextMenuIdMap: {
                  ...prev.hoverContextMenuIdMap,
                  [nodeId || '']: nextContextMenuItem.contextMenuId,
                },
                lastHoverContextMenuId: nextContextMenuItem.contextMenuId,
              }
            }
            focusTextarea()
            return prev
          })
          lastKeydownEvent.current = null
        }
      },
      loop: true,
      virtual: true,
    })
    const typeahead = useTypeahead(context, {
      enabled: isOpen,
      listRef: listContentRef,
      onMatch: isOpen ? setActiveIndex : undefined,
      activeIndex,
    })
    const { getReferenceProps, getFloatingProps, getItemProps } =
      useInteractions([
        hover,
        click,
        role,
        dismiss,
        /**
         * useListNavigation.ts的源码第703行，合并后的referenceProps的onKeyDown方法里对垂直方向上下键调用了stopEvent(event)，
         * 所以会导致AutoHeightTextarea组件在多行输入的时候，按上下键无效，默认事件被禁止
         * 目前先更改AutoHeightTextarea组件的onKeyDown，MenuList是隐藏状态下就禁止方向键的冒泡
         */
        listNavigation,
        typeahead,
      ])
    // Event emitter allows you to communicate across tree components.
    // This effect closes all menus when an item gets clicked anywhere
    // in the tree.
    React.useEffect(() => {
      if (!tree) return
      function handleTreeClick() {
        if (!customOpen) {
          setIsOpen(false)
        }
      }
      function onSubMenuOpen(event: { nodeId: string; parentId: string }) {
        if (event.nodeId !== nodeId && event.parentId === parentId) {
          setIsOpen(false)
        }
      }
      tree.events.on('click', handleTreeClick)
      tree.events.on('menuopen', onSubMenuOpen)
      return () => {
        tree.events.off('click', handleTreeClick)
        tree.events.off('menuopen', onSubMenuOpen)
      }
    }, [tree, nodeId, parentId, customOpen])
    React.useEffect(() => {
      if (isOpen && tree) {
        tree.events.emit('menuopen', { parentId, nodeId })
      }
    }, [tree, isOpen, nodeId, parentId])
    // Determine if "hover" logic can run based on the modality of input. This
    // prevents unwanted focus synchronization as menus open and close with
    // keyboard navigation and the cursor is resting on the menu.
    React.useEffect(() => {
      function onPointerMove({ pointerType }: PointerEvent) {
        if (pointerType !== 'touch') {
          setAllowHover(true)
        }
      }
      function onKeyDown() {
        setAllowHover(false)
      }
      window.addEventListener('pointermove', onPointerMove, {
        once: true,
        capture: true,
      })
      window.addEventListener('keydown', onKeyDown, true)
      return () => {
        window.removeEventListener('pointermove', onPointerMove, {
          capture: true,
        })
        window.removeEventListener('keydown', onKeyDown, true)
      }
    }, [allowHover])

    useEffect(() => {
      let destroy = false
      if (
        isFirstDeep &&
        floatingDropdownMenuSelectedItem.lastHoverContextMenuId
      ) {
        if (children) {
          setTimeout(() => {
            if (destroy) {
              return
            }
            setActiveIndex((prevState) => {
              const lastHoverIndex = (children as any).findIndex(
                (child: any) =>
                  child?.key ===
                  floatingDropdownMenuSelectedItem.lastHoverContextMenuId,
              )
              if (lastHoverIndex !== -1 && prevState === null) {
                console.log(
                  'findChildrenIndexWithKey',
                  lastHoverIndex,
                  prevState,
                  children,
                  nodeId,
                )
                return lastHoverIndex
              }
              return prevState
            })
          }, 0)
        }
      }
      return () => {
        destroy = true
      }
    }, [floatingDropdownMenuSelectedItem.lastHoverContextMenuId, children])
    const referenceRef = useMergeRefs([refs.setReference, forwardedRef])
    const handleExecuteActions = useCallback(() => {
      const lastHoverId =
        floatingDropdownMenuSelectedItem.lastHoverContextMenuId
      if (lastHoverId) {
        const menuItem =
          getMaxAIFloatingContextMenuRootElement()?.querySelector(
            `[data-id="${lastHoverId}"]`,
          ) as HTMLDivElement
        if (menuItem) {
          menuItem.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Enter',
              bubbles: true,
              cancelable: true,
              code: 'Enter',
              keyCode: 13,
            }),
          )
        }
      }
    }, [floatingDropdownMenuSelectedItem])
    useEffect(() => {
      if (!floatingDropdownMenu.open) {
        resetActiveIndex()
        setFloatingDropdownMenuSelectedItem((prevState) => {
          return {
            ...prevState,
            hoverContextMenuIdMap: {},
            lastHoverContextMenuId: null,
          }
        })
      }
    }, [floatingDropdownMenu.open])

    return (
      <FloatingNode id={nodeId}>
        {referenceElement ? (
          React.isValidElement(referenceElement) &&
          React.cloneElement(referenceElement, {
            ...getReferenceProps({
              ...props,
              className: `${isNested ? 'MenuItem' : 'RootMenu'}`,
              onClick(event) {
                event.stopPropagation()
                onClickReferenceElement?.(event)
              },
              onKeyDownCapture(event) {
                // 如果是enter非shiftKey并且是根节点
                if (event.key === 'Enter' && !event.shiftKey && !parentId) {
                  handleExecuteActions()
                  return
                }
                // 如果是方向键
                if (
                  event.key === 'ArrowDown' ||
                  event.key === 'ArrowUp' ||
                  event.key === 'ArrowLeft' ||
                  event.key === 'ArrowRight'
                ) {
                  lastHoverDropdownMenuItemRef.current = null
                  console.log(
                    `${
                      !parentId ? `[根级]` : `[子级]`
                    }[${nodeId}]onNavigate---[按键触发][${event.key}]\n`,
                    lastParentDropdownMenuItemRef.current,
                    activeIndex,
                  )
                  if (event.key === 'ArrowLeft') {
                    if (!parentId && lastParentDropdownMenuItemRef.current) {
                      const nodeDetail = getFloatingUIDropdownItemDetail(
                        lastParentDropdownMenuItemRef.current,
                      )
                      if (nodeDetail?.parentDropdownSelectedItem) {
                        // 这一步是为了让floating ui的focus节点还原
                        // focus 自身
                        nodeDetail.dropdownSelectedItem!.focus()
                        // 触发event
                        nodeDetail.dropdownSelectedItem!.dispatchEvent(
                          new KeyboardEvent('keydown', {
                            key: event.key,
                            bubbles: true,
                            cancelable: true,
                          }),
                        )
                        // 因为通过keydownEvent来决定触发的时机，所以得让parentItem也触发一次keydown
                        if (
                          nodeDetail.parentDropdownSelectedItem &&
                          nodeDetail.id
                        ) {
                          nodeDetail.parentDropdownSelectedItem!.setAttribute(
                            'data-lastid',
                            nodeDetail.id,
                          )
                          nodeDetail.parentDropdownSelectedItem!.focus()
                          if (
                            nodeDetail.parentDropdownSelectedItem.classList.contains(
                              'RootMenu',
                            )
                          ) {
                            lastParentDropdownMenuItemRef.current = null
                          } else {
                            lastParentDropdownMenuItemRef.current =
                              nodeDetail.parentDropdownSelectedItem
                          }
                          nodeDetail.parentDropdownSelectedItem!.dispatchEvent(
                            new KeyboardEvent('keydown', {
                              key: 'ArrowDown',
                              bubbles: true,
                              cancelable: true,
                            }),
                          )
                        }
                      }
                    }
                    return
                  } else if (
                    event.key === 'ArrowRight' &&
                    !parentId &&
                    activeIndex !== null
                  ) {
                    let el = listItemsRef.current[activeIndex]
                    // 如果已经有lastDropdownMenuRef.current, 说明触发的第三级、第四级菜单等
                    if (lastParentDropdownMenuItemRef.current) {
                      // aria-controls=":r2m:" aria-activedescendant=":r2v:"
                      // 寻找二级菜单控制的第三集菜单的根节点
                      const lastDropdownMenuId =
                        lastParentDropdownMenuItemRef.current
                          ?.getAttribute('aria-controls')
                          ?.replace(/:/g, '\\:')
                      // 第三级菜单的容器
                      const lastDropdownMenu =
                        getMaxAIFloatingContextMenuRootElement()?.querySelector(
                          `#${lastDropdownMenuId}`,
                        ) as HTMLDivElement
                      if (lastDropdownMenu) {
                        // 第三级菜单的选中项
                        const itemId = lastDropdownMenu
                          .getAttribute('aria-activedescendant')
                          ?.replace(/:/g, '\\:')
                        const item = lastDropdownMenu.querySelector(
                          `#${itemId}`,
                        ) as HTMLDivElement
                        if (item.id && item.getAttribute('aria-haspopup')) {
                          el = item
                        }
                      }
                    }
                    if (el && el.getAttribute('aria-haspopup') === 'menu') {
                      // focus 自身
                      el.focus()
                      // 触发event
                      el.dispatchEvent(
                        new KeyboardEvent('keydown', {
                          key: event.key,
                          bubbles: true,
                          cancelable: true,
                        }),
                      )
                      lastParentDropdownMenuItemRef.current = el
                    }
                    return
                  } else if (lastParentDropdownMenuItemRef.current) {
                    lastParentDropdownMenuItemRef.current.focus()
                    // 触发event
                    lastParentDropdownMenuItemRef.current.dispatchEvent(
                      new KeyboardEvent('keydown', {
                        key: event.key,
                        bubbles: true,
                        cancelable: true,
                      }),
                    )
                    return
                  }
                  const textareaEl =
                    getMaxAIFloatingContextMenuRootElement()?.querySelector(
                      `#${MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID}`,
                    ) as HTMLTextAreaElement
                  textareaEl?.focus()
                  // console.log(
                  //   `${
                  //     !parentId ? `[根级]` : `[子级]`
                  //   }[${nodeId}]onNavigate---[按键触发结束][${event.key}]\n`,
                  //   lastParentDropdownMenuItemRef.current,
                  //   activeIndex,
                  // )
                  lastKeydownEvent.current = event
                }
              },
              ...(isNested && {
                // Indicates this is a nested <Menu /> acting as a <MenuItem />.
                role: 'menuitem',
              }),
              ref: referenceRef,
            }),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // ref: referenceRef,
          })
        ) : (
          <Button
            ref={referenceRef}
            // data-open={isOpen ? '' : undefined}
            {...getReferenceProps({
              ...props,
              className: `${isNested ? 'MenuItem' : 'RootMenu'}`,
              onClick(event) {
                event.stopPropagation()
              },
              ...(isNested && {
                // Indicates this is a nested <Menu /> acting as a <MenuItem />.
                role: 'menuitem',
              }),
            })}
            startIcon={
              <UseChatGptIcon
                sx={{
                  fontSize: 16,
                  color: 'inherit',
                }}
              />
            }
            variant={'outlined'}
          >
            {label || 'Use ChatGPT'}
          </Button>
        )}
        <FloatingPortal root={root}>
          {isOpen && React.Children.count(children) && (
            <FloatingFocusManager
              context={context}
              // Prevent outside content interference.
              modal={false}
              // Only initially focus the root floating menu.
              // initialFocus={isNested || referenceElement ? -1 : 0}
              // returnFocus={!isNested}
              initialFocus={-1}
              visuallyHiddenDismiss
            >
              <Box
                sx={{
                  zIndex: (zIndex || 0) + 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 0.5,
                  outline: 'none!important',
                  width: menuWidth,
                  maxHeight: 327,
                  boxSizing: 'border-box',
                  overflowY: 'auto',
                  // border: '1px solid rgb(237,237,236)',
                  border: '1px solid',
                  borderColor: 'customColor.borderColor',
                  bgcolor: 'background.paper',
                  borderRadius: '6px',
                  boxShadow:
                    'rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
                  '& *': {
                    outline: 'none!important',
                  },
                  '&:has(.max-ai--popper-wrapper)': {
                    overflowY: 'unset',
                  },
                  ...menuSx,
                }}
                component={'div'}
                ref={refs.setFloating}
                className="Menu"
                style={{
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                }}
                {...getFloatingProps()}
              >
                {React.Children.map(
                  children,
                  (child, index) =>
                    React.isValidElement(child) &&
                    React.cloneElement(
                      child,
                      getItemProps({
                        tabIndex: activeIndex === index ? 0 : -1,
                        ref(node: any) {
                          listItemsRef.current[index] = node
                        },
                        onMouseDown(event) {
                          if (onClickContextMenu) {
                            tree?.events.emit('click')
                            if (
                              child.props?.menuItem?.data?.type === 'shortcuts'
                            ) {
                              onClickContextMenu?.(child.props.menuItem)
                            }
                          }
                        },
                        onClick(event) {
                          if (onClickContextMenu) {
                            return
                          }
                          child.props.onClick?.(event)
                          tree?.events.emit('click')
                        },
                        onKeyDownCapture(event) {
                          lastKeydownEvent.current = event
                        },
                        // Allow focus synchronization if the cursor did not move.
                        onMouseEnter(event) {
                          event.stopPropagation()
                          event.preventDefault()
                          const target = event.currentTarget as HTMLDivElement
                          if (target.getAttribute('data-id')) {
                            lastParentDropdownMenuItemRef.current = target
                            const nodeDetail =
                              getFloatingUIDropdownItemDetail(target)
                            if (nodeDetail?.id || nodeDetail?.contextMenuId) {
                              // 关闭开着的group
                              if (nodeDetail.expandedSiblingMenuItem) {
                                // 如果是同一个group，不关闭
                                if (
                                  nodeDetail.expandedSiblingMenuItem?.getAttribute(
                                    'data-id',
                                  ) === nodeDetail.contextMenuId
                                ) {
                                  return
                                }
                                const expandDropdownItemDetail =
                                  getFloatingUIDropdownItemDetail(
                                    nodeDetail.expandedSiblingMenuItem,
                                  )
                                if (
                                  expandDropdownItemDetail?.dropdownSelectedItem
                                ) {
                                  console.log(
                                    `${nodeId}onNavigate---[onMouseEnter][关闭组]`,
                                  )
                                  // 关闭开着的group
                                  const mockKeydownEvent = new KeyboardEvent(
                                    'keydown',
                                    {
                                      key: 'ArrowLeft',
                                      bubbles: true,
                                      cancelable: true,
                                    },
                                  )
                                  lastHoverDropdownMenuItemRef.current =
                                    expandDropdownItemDetail.dropdownSelectedItem
                                  expandDropdownItemDetail.dropdownSelectedItem.focus()
                                  expandDropdownItemDetail.dropdownSelectedItem.dispatchEvent(
                                    mockKeydownEvent,
                                  )
                                  // 原本的menu也需要触发一次keydown
                                  nodeDetail.expandedSiblingMenuItem.setAttribute(
                                    'data-lastid',
                                    nodeDetail.contextMenuId,
                                  )
                                  if (
                                    nodeDetail.expandedSiblingMenuItem.classList.contains(
                                      'RootMenu',
                                    )
                                  ) {
                                    lastParentDropdownMenuItemRef.current = null
                                  } else {
                                    lastParentDropdownMenuItemRef.current =
                                      expandDropdownItemDetail.parentDropdownSelectedItem
                                  }
                                  nodeDetail.expandedSiblingMenuItem.focus()
                                  nodeDetail.expandedSiblingMenuItem.dispatchEvent(
                                    new KeyboardEvent('keydown', {
                                      key: 'ArrowDown',
                                      bubbles: true,
                                      cancelable: true,
                                    }),
                                  )
                                }
                              }
                            }
                            // 这是group
                            if (nodeDetail?.id) {
                              console.log(
                                `${nodeId}onNavigate---[onMouseEnter][打开组]`,
                              )
                              // 这是item
                              // mock keydown event
                              const mockKeydownEvent = new KeyboardEvent(
                                'keydown',
                                {
                                  key: 'ArrowDown',
                                  bubbles: true,
                                  cancelable: true,
                                },
                              )
                              lastHoverDropdownMenuItemRef.current = target
                              // 触发event
                              nodeDetail.keydownEmitElement?.dispatchEvent(
                                mockKeydownEvent,
                              )
                              // mock keydown event
                              const mockKeyRightEvent = new KeyboardEvent(
                                'keydown',
                                {
                                  key: 'ArrowRight',
                                  bubbles: true,
                                  cancelable: true,
                                },
                              )
                              lastHoverDropdownMenuItemRef.current = target
                              // 触发event
                              target.dispatchEvent(mockKeyRightEvent)
                            } else if (nodeDetail?.contextMenuId) {
                              console.log(
                                `${nodeId}onNavigate---[onMouseEnter][打开item]`,
                              )
                              // 这是item
                              // mock keydown event
                              const mockKeydownEvent = new KeyboardEvent(
                                'keydown',
                                {
                                  key: 'ArrowDown',
                                  bubbles: true,
                                  cancelable: true,
                                },
                              )
                              lastHoverDropdownMenuItemRef.current = target
                              // 触发event
                              target.dispatchEvent(mockKeydownEvent)
                            }
                          }
                        },
                      }),
                    ),
                )}
              </Box>
            </FloatingFocusManager>
          )}
        </FloatingPortal>
      </FloatingNode>
    )
  },
)

// eslint-disable-next-line react/display-name
export const DropdownMenu = React.forwardRef<
  any,
  MenuProps & React.HTMLProps<any>
>((props, ref) => {
  const parentId = useFloatingParentNodeId()
  if (parentId === null) {
    return (
      <FloatingTree>
        <MenuComponent {...props} ref={ref} />
      </FloatingTree>
    )
  }
  return <MenuComponent {...props} ref={ref} />
})

type FloatingUIDropdownItemDetail = {
  id: string
  contextMenuId: string
  isMenu: boolean
  parentDropdownSelectedItem: HTMLDivElement | null
  parentDropdown: HTMLDivElement | null
  dropdownMenu: HTMLDivElement | null
  dropdownSelectedItem: HTMLDivElement | null
  keydownEmitElement: HTMLDivElement | null
  expandedSiblingMenuItem: HTMLDivElement | null
}

// 下面的方法都是为了找floating ui的层级关系
const getFloatingUIDropdownItemDetail = (
  node: HTMLDivElement,
): FloatingUIDropdownItemDetail | null => {
  const root = getMaxAIFloatingContextMenuRootElement() as HTMLDivElement
  if (!node || !root) {
    return null
  }
  const id = node.getAttribute('id')?.replace(/:/g, '\\:') || ''
  const contextMenuId = node.getAttribute('data-id') || ''
  const isMenu = node.getAttribute('aria-haspopup') === 'menu'
  const parentDropdownSelectedItem = root.querySelector(
    `div[aria-haspopup="menu"][aria-activedescendant="${id}"]`,
  ) as HTMLDivElement
  const parentDropdownId = parentDropdownSelectedItem
    ?.getAttribute('aria-controls')
    ?.replace(/:/g, '\\:')
  const parentDropdown = parentDropdownId
    ? (root.querySelector(`#${parentDropdownId}`) as HTMLDivElement)
    : null
  const dropdownId = node.getAttribute('aria-controls')?.replace(/:/g, '\\:')
  const dropdownMenu = dropdownId
    ? (root.querySelector(`#${dropdownId}`) as HTMLDivElement)
    : null
  // NOTE: 这里不是用户选择的，是因为menu无法触发关闭
  // const dropdownSelectedId = node
  //   .getAttribute('aria-activedescendant')
  //   ?.replace(/:/g, '\\:')
  let dropdownSelectedItem = null
  if (dropdownMenu && !dropdownSelectedItem) {
    // 说明子级选择的不是menu而是menuitem
    dropdownSelectedItem = dropdownMenu.querySelector(
      '.floating-context-menu-item--active:not([aria-haspopup="menu"])',
    ) as HTMLDivElement
    if (!dropdownSelectedItem) {
      dropdownSelectedItem = dropdownMenu.querySelector(
        '.floating-context-menu-item:not([aria-haspopup="menu"])',
      ) as HTMLDivElement
    }
  }
  const keydownEmitElement = node.parentElement?.querySelector(
    `.floating-context-menu-item:not([aria-haspopup="menu"])`,
  ) as HTMLDivElement
  const expandedSiblingMenuItem = node.parentElement?.querySelector(
    `.floating-context-menu-item[aria-expanded="true"]`,
  ) as HTMLDivElement
  return {
    id,
    contextMenuId,
    isMenu,
    parentDropdownSelectedItem,
    parentDropdown,
    dropdownMenu,
    dropdownSelectedItem,
    keydownEmitElement,
    expandedSiblingMenuItem,
  }
}
