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

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { FAVORITE_CONTEXT_MENU_GROUP_ID } from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import TreeNavigatorMatcher from '@/features/sidebar/utils/treeNavigatorMatcher'

interface DropdownItemProps {
  menuItem: IContextMenuItemWithChildren
  disabled?: boolean
  hoverIcon?: React.ReactNode
  matcher?: TreeNavigatorMatcher
}

/**
 *  列表项渲染
 */
export const DropdownItem = React.forwardRef<HTMLElement, DropdownItemProps>(
  ({ disabled, menuItem, matcher, ...props }, ref) => {
    const { t } = useTranslation(['prompt'])
    const menuLabel = useMemo(() => {
      const id = menuItem.id.replace(FAVORITE_CONTEXT_MENU_GROUP_ID, '')
      const key: any = `prompt:${id}`
      if (t(key) !== id) {
        return t(key)
      }
      return menuItem.text
    }, [menuItem.text, t])

    const isHover = useMemo(() => matcher?.match(menuItem), [matcher?.path])

    const boxRef = React.useRef<HTMLDivElement>()

    React.useEffect(() => {
      if (isHover && boxRef.current && boxRef.current.parentElement) {
        const parentElement = boxRef.current.parentElement
        const itemHeight = 45

        if (
          boxRef.current.offsetTop + itemHeight >
          parentElement.clientHeight + parentElement.scrollTop
        ) {
          parentElement.scrollTo({
            left: parentElement.scrollLeft,
            top: parentElement.scrollTop + itemHeight,
          })
        } else if (
          boxRef.current.offsetTop <
          parentElement.scrollTop + itemHeight
        ) {
          parentElement.scrollTo({
            left: parentElement.scrollLeft,
            top: parentElement.scrollTop - itemHeight,
          })
        }
      }
    }, [isHover])

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
        onMouseEnter={() => {
          matcher?.setHoverItem(menuItem)
        }}
        ref={(dom: HTMLDivElement) => {
          if (!dom) return
          if (ref) {
            if (typeof ref === 'function') ref(dom)
            else ref.current = dom

            boxRef.current = dom
          }
        }}
        component={'div'}
        role='menuitem'
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
  matcher?: TreeNavigatorMatcher

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

    const isNested = parentId != null
    const [_isOpen, setIsOpen] = React.useState(openProp ?? false)
    /**
     * 修正open，当props传递的时候永远优先使用props
     */
    const isOpen = useMemo(() => _isOpen || openProp, [openProp, _isOpen])
    const listItemsRef = React.useRef<Array<any | null>>([])

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
                        // tabIndex: focusItem === child.props?.menuItem ? 0 : -1,
                        ref(node) {
                          listItemsRef.current[index] = node
                        },
                        onClick() {
                          if (
                            onClickContextMenu &&
                            child.props?.menuItem?.data?.type === 'shortcuts'
                          ) {
                            onClickContextMenu?.(child.props.menuItem)
                          }
                        },
                        onMouseEnter(event) {
                          // setFocusItem(child.props?.menuItem)
                          // TODO:
                          event.stopPropagation()
                        },
                      }),
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
