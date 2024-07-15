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
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
} from '@floating-ui/react'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { atom, selector, useRecoilState, useRecoilValue } from 'recoil'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { FAVORITE_CONTEXT_MENU_GROUP_ID } from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'

interface DropdownItemProps {
  menuItem: IContextMenuItemWithChildren
  focus?: boolean
  disabled?: boolean
  hoverIcon?: React.ReactNode
}

export const DropdownMenuSelectedItemState = atom<{
  hoverContextMenuIdMap: {
    [key: string]: string
  }
  lastHoverContextMenuId: string | null
  selectedContextMenuId: string | null
}>({
  key: 'DropdownMenuSelectedItemState',
  default: {
    hoverContextMenuIdMap: {},
    selectedContextMenuId: null,
    lastHoverContextMenuId: null,
  },
})

const DropdownMenuIHovertemsSelector = selector<string[]>({
  key: 'DropdownMenuItemsSelector',
  get: ({ get }) => {
    const hoverIdMap = get(DropdownMenuSelectedItemState).hoverContextMenuIdMap
    return Object.values(hoverIdMap).filter((id) => id)
  },
})

/**
 *  列表项渲染
 */
export const DropdownItem = React.forwardRef<HTMLElement, DropdownItemProps>(
  ({ disabled, menuItem, hoverIcon, focus, ...props }, ref) => {
    const { t } = useTranslation(['prompt'])
    const hoverIds = useRecoilValue(DropdownMenuIHovertemsSelector)
    const [
      floatingDropdownMenuSelectedItem,
      setFloatingDropdownMenuSelectItem,
    ] = useRecoilState(DropdownMenuSelectedItemState)
    const menuLabel = useMemo(() => {
      const id = menuItem.id.replace(FAVORITE_CONTEXT_MENU_GROUP_ID, '')
      const key: any = `prompt:${id}`
      if (t(key) !== id) {
        return t(key)
      }
      return menuItem.text
    }, [menuItem.text, t])

    const isHover = useMemo(() => {
      return hoverIds.includes(menuItem.id) || focus
    }, [
      hoverIds,
      floatingDropdownMenuSelectedItem.lastHoverContextMenuId,
      focus,
    ])

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
        aria-disabled={disabled}
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
        role='menuitem'
        onClick={() => {
          setFloatingDropdownMenuSelectItem((prevState) => {
            return {
              ...prevState,
              selectedContextMenuId: menuItem.id,
            }
          })
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
          ) : isLastHover && hoverIcon ? (
            hoverIcon
          ) : (
            <KeyboardReturnIcon
              className='floating-context-menu-item__footer-hover-icon'
              sx={{
                color: (t) =>
                  t.palette.mode === 'dark'
                    ? '#ffffff85'
                    : 'rgba(55, 53, 47, 0.45)',
                fontSize: 16,
              }}
            />
          )}
        </span>
      </Box>
    )
  },
)

DropdownItem.displayName = 'DropdownMenuItem'

export interface MenuProps {
  label: string
  nested?: boolean
  children?: React.ReactNode
  root?: HTMLElement
  referenceElement?: React.ReactNode
  referenceElementRef?: React.ForwardedRef<any>
  open?: boolean
  needAutoUpdate?: boolean
  zIndex?: number
  sx?: SxProps
  defaultPlacement?: Placement
  defaultFallbackPlacements?: Placement[]
  onClickContextMenu?: (contextMenu: IContextMenuItem) => void
  menuWidth?: number
  hoverIcon?: React.ReactNode
  /**
   * 匹配字符串，用来替代useTypeahead
   */
  matchString?: string

  onNavigate?: (
    arrow: 'ArrowUp' | 'ArrowLeft' | 'ArrowDown' | 'ArrowRight',
  ) => void
}

/**
 * 渲染了一个子项和一个新的列表（当hover时候显示或者控制显示）
 * 默认第一级的时候显示
 */
export const DropdownMenuInternal = React.forwardRef<
  HTMLElement,
  MenuProps & React.HTMLProps<any>
>(
  (
    {
      referenceElement,
      referenceElementRef,
      zIndex = 0,
      children,
      label,
      root,
      open: openProp,
      needAutoUpdate = false,
      sx,
      defaultPlacement,
      defaultFallbackPlacements,
      onClickContextMenu,
      menuWidth = 400,
      matchString,
      ...props
    },
    forwardedRef,
  ) => {
    const nodeId = useFloatingNodeId()
    const parentId = useFloatingParentNodeId()
    /**
     * 判断是否是第一级菜单
     */
    const isFirstLevelDropdown = !parentId && zIndex === 2147483601

    const [focusItem, setFocusItem] = React.useState<IContextMenuItem | null>(
      null,
    )
    const isNested = parentId != null
    const [_isOpen, setIsOpen] = React.useState(openProp ?? false)
    /**
     * 修正open，当props传递的时候永远优先使用props
     */
    const isOpen = useMemo(
      () => (openProp === undefined ? _isOpen : openProp),
      [openProp, _isOpen],
    )
    const listItemsRef = React.useRef<Array<any | null>>([])

    /**
     * 只根据matchString变化的时候去更新hoveringItem
     */
    React.useEffect(() => {
      // 空字符串时不匹配
      if (!matchString || !isFirstLevelDropdown || !isOpen) return
      const menuItems = React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? {
              label: child.props.label as string,
              item: child.props?.menuItem as IContextMenuItem | null,
            }
          : null,
      )
      if (!menuItems) return
      // 最匹配标签的开始匹配位置
      let extraMatchIndex = Infinity
      // 最匹配标签的位置
      let extraMatchItemIndex = 0
      for (let i = 0; i < menuItems.length; i++) {
        const item = menuItems[i]
        if (!item || !item.label || !item.item) continue

        const index = item.label.indexOf(matchString)
        if (index < extraMatchIndex) {
          extraMatchIndex = index
          extraMatchItemIndex = i
        }
      }

      setFocusItem(menuItems[extraMatchItemIndex]?.item)
    }, [matchString])

    const currentPlacement =
      defaultPlacement ||
      (isFirstLevelDropdown ? 'bottom-start' : 'right-start')
    const currentFallbackPlacements =
      defaultFallbackPlacements ||
      (isFirstLevelDropdown
        ? ['bottom-start', 'top-start', 'right']
        : [
            'right',
            'right-start',
            'right-end',
            'left',
            'left-start',
            'left-end',
          ])

    const { x, y, strategy, refs, context } = useFloating<any>({
      nodeId,
      open: isOpen,
      onOpenChange: (show) => {
        if (openProp !== undefined) return
        setIsOpen(show)
      },
      placement: currentPlacement,
      middleware: [
        offset({
          mainAxis: isFirstLevelDropdown ? 4 : 0,
          alignmentAxis: isFirstLevelDropdown ? 0 : -4,
        }),
        flip({
          fallbackPlacements: currentFallbackPlacements,
        }),
        shift(),
      ],
      whileElementsMounted: needAutoUpdate ? autoUpdate : undefined,
    })
    const role = useRole(context, { role: 'menu' })
    const dismiss = useDismiss(context)

    const hover = useHover(context, {
      delay: { open: 100, close: 100 },
      handleClose: safePolygon({
        blockPointerEvents: false,
      }),
    })

    const { getReferenceProps, getFloatingProps, getItemProps } =
      useInteractions([role, dismiss, hover])

    const referenceRef = useMergeRefs([
      refs.setReference,
      forwardedRef,
      referenceElementRef,
    ])

    return (
      <FloatingNode id={nodeId}>
        {referenceElement ? (
          React.isValidElement(referenceElement) &&
          React.cloneElement(referenceElement, {
            ...getReferenceProps({
              ...props,
              className: `${isNested ? 'MenuItem' : 'RootMenu'}`,
              ...(isNested && {
                // Indicates this is a nested <Menu /> acting as a <MenuItem />.
                role: 'menuitem',
              }),
              ref: referenceRef,
            }),
          })
        ) : (
          <Button
            ref={referenceRef}
            {...getReferenceProps({
              ...props,
              className: `${isNested ? 'MenuItem' : 'RootMenu'}`,
              onClick(event) {
                event.stopPropagation()
              },
              ...(isNested && {
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
              modal={false}
              initialFocus={-1}
              visuallyHiddenDismiss
            >
              <Box
                sx={{
                  zIndex: zIndex + 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 0.5,
                  outline: 'none!important',
                  width: menuWidth,
                  maxHeight: 327,
                  boxSizing: 'border-box',
                  overflowY: 'auto',
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
                  ...sx,
                }}
                component='div'
                ref={refs.setFloating}
                className='Menu dropdown-menu'
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
                    React.cloneElement(child, {
                      ...getItemProps({
                        tabIndex: focusItem === child.props?.menuItem ? 0 : -1,
                        ref(node) {
                          listItemsRef.current[index] = node
                        },
                        onMouseDown() {
                          if (
                            onClickContextMenu &&
                            child.props?.menuItem?.data?.type === 'shortcuts'
                          ) {
                            onClickContextMenu?.(child.props.menuItem)
                          }
                        },
                        onMouseEnter(event) {
                          setFocusItem(child.props?.menuItem)
                          event.stopPropagation()
                        },
                      }),
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      focus: focusItem === child?.props?.menuItem,
                    }),
                )}
              </Box>
            </FloatingFocusManager>
          )}
        </FloatingPortal>
      </FloatingNode>
    )
  },
)

DropdownMenuInternal.displayName = 'MenuComponent'

export const DropdownMenu = React.forwardRef<
  any,
  MenuProps & React.HTMLProps<any>
>((props, ref) => {
  const parentId = useFloatingParentNodeId()
  if (parentId === null) {
    return (
      <FloatingTree>
        <DropdownMenuInternal {...props} ref={ref} />
      </FloatingTree>
    )
  }
  return <DropdownMenuInternal {...props} ref={ref} />
})

DropdownMenu.displayName = 'DropdownMenu'
