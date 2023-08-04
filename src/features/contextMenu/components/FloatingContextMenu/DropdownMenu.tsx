import * as React from 'react'
import {
  useFloating,
  offset,
  flip,
  shift,
  useListNavigation,
  useHover,
  useTypeahead,
  useInteractions,
  useRole,
  useClick,
  useDismiss,
  safePolygon,
  FloatingPortal,
  useFloatingTree,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useMergeRefs,
  FloatingNode,
  FloatingTree,
  FloatingFocusManager,
  autoUpdate,
  Placement,
} from '@floating-ui/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/material/styles'

import { useEffect, useMemo, useRef } from 'react'
import {
  FloatingDropdownMenuItemsSelector,
  FloatingDropdownMenuSelectedItemState,
} from '@/features/contextMenu/store'
import {
  ContextMenuIcon,
  IContextMenuIconKey,
} from '@/components/ContextMenuIcon'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import { useRecoilValue, useRecoilState } from 'recoil'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { IContextMenuItemWithChildren } from '@/features/contextMenu/types'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import { FAVORITE_CONTEXT_MENU_GROUP_ID } from '@/features/contextMenu/hooks/useFavoriteContextMenuList'

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
      onClick={(event) => {
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
        onKeyDown={(event) => {
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
        onClick={(event) => {
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
      hoverOpen = false,
      customOpen = false,
      needAutoUpdate = false,
      menuSx,
      defaultPlacement,
      defaultFallbackPlacements,
      ...props
    },
    forwardedRef,
  ) => {
    const tree = useFloatingTree()
    const nodeId = useFloatingNodeId()
    const parentId = useFloatingParentNodeId()
    const isFirstDeep = !parentId && zIndex === 2147483601
    const [floatingDropdownMenuSelectedItem, updateHoverMenuId] =
      useRecoilState(FloatingDropdownMenuSelectedItemState)
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
    const [allowHover, setAllowHover] = React.useState(false)
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
        : ['right', 'left', 'bottom', 'top'])
    const { x, y, strategy, refs, context } = useFloating<any>({
      nodeId,
      open: isOpen,
      onOpenChange: (show) => {
        console.log(nodeId, parentId, 'onNavigateonNavigateonNavigate open')
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
      enabled: (isNested || hoverOpen) && allowHover,
      delay: { open: 75 },
      handleClose: safePolygon({
        restMs: 25,
        blockPointerEvents: true,
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
        if (index === activeIndex) {
          return
        }
        const keydownKey = lastKeydownEvent.current?.key
        if (keydownKey) {
          console.log(`[${nodeId}]onNavigate---[current]\n${keydownKey}`)
          // index === null 代表失去焦点了:
          // 1. input被focus会触发, 所以index没有实际意义
          // 过滤不是contextMenu的选项
          const contextMenuIdList: Array<{
            contextMenuId: string
            contextMenuIndex: number
          }> = []
          listItemsRef.current?.forEach((item, index) => {
            const contextMenuId = item?.getAttribute('data-id')
            if (!contextMenuId) {
              return
            }
            contextMenuIdList.push({
              contextMenuId,
              contextMenuIndex: index,
            })
          })
          updateHoverMenuId((prev) => {
            const lastHoverContextMenuId = prev.lastHoverContextMenuId
            const currentIndex = contextMenuIdList.findIndex(
              (item) => item.contextMenuId === lastHoverContextMenuId,
            )
            // 如果按的是左右的方向键
            if (keydownKey === 'ArrowRight' || keydownKey === 'ArrowLeft') {
              // 如果 当前面板找不到最后hover的contextMenuId并且有index, 说明是按方向键切换面板了
              if (currentIndex === -1 && index !== null) {
                const nextContextMenuItem =
                  contextMenuIdList[index] || contextMenuIdList[0]
                setActiveIndex(nextContextMenuItem.contextMenuIndex)
                return {
                  ...prev,
                  lastHoverContextMenuId: nextContextMenuItem.contextMenuId,
                }
              }
            }
            if (currentIndex === -1) {
              return prev
            }
            // console.log(
            //   `[${nodeId}]onNavigate---[current]\n`,
            //   `[floatinguiIndex=${index}]`,
            //   `[自己酸的=${currentIndex}]`,
            //   lastHoverContextMenuId,
            //   contextMenuIdList,
            // )
            if (currentIndex === index) {
              return prev
            }
            let nextContextMenuItem: {
              contextMenuId: string
              contextMenuIndex: number
            } | null = null
            if (keydownKey === 'ArrowDown') {
              // 寻找下一个，如果是最后一个，回到开头
              if (contextMenuIdList[currentIndex + 1]) {
                nextContextMenuItem = contextMenuIdList[currentIndex + 1]
              } else {
                nextContextMenuItem = contextMenuIdList[0]
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
              //   `[${nodeId}]onNavigate---[next]\n`,
              //   keydownKey,
              //   nextContextMenuItem.contextMenuIndex,
              //   nextContextMenuItem.contextMenuId,
              // )
              setActiveIndex(nextContextMenuItem.contextMenuIndex)
              return {
                ...prev,
                lastHoverContextMenuId: nextContextMenuItem.contextMenuId,
              }
            }
            return prev
          })
          lastKeydownEvent.current = null
        }
      },
      loop: true,
      // virtual: referenceElement ? true : false,
    })
    const typeahead = useTypeahead(context, {
      enabled: isOpen,
      listRef: listContentRef,
      onMatch: isOpen ? setActiveIndex : undefined,
      activeIndex,
    })
    const { getReferenceProps, getFloatingProps, getItemProps } =
      useInteractions([hover, click, role, dismiss, listNavigation, typeahead])
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
              console.log(
                '纯纯粹粹',
                lastHoverIndex,
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
              },
              onKeyDownCapture(event) {
                console.log(`[${nodeId}]onNavigate---[onKeyDownCapture]\n`)
                if (
                  event.key === 'ArrowLeft' ||
                  (event.key === 'ArrowRight' && activeIndex !== null)
                ) {
                  const el = listItemsRef.current[activeIndex]
                  if (el) {
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
                  }
                  return
                }
                lastKeydownEvent.current = event
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
              initialFocus={isNested || referenceElement ? -1 : 0}
              // Only return focus to the root menu's reference when menus close.
              returnFocus={!isNested}
              // visuallyHiddenDismiss
            >
              <Box
                sx={{
                  zIndex: (zIndex || 0) + 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 0.5,
                  outline: 'none!important',
                  width: 400,
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
                        onClick(event) {
                          child.props.onClick?.(event)
                          tree?.events.emit('click')
                        },
                        // Allow focus synchronization if the cursor did not move.
                        onMouseEnter() {
                          if (allowHover && isOpen && child.props?.menuItem) {
                            setActiveIndex(index)
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
