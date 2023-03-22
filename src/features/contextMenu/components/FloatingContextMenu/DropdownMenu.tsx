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
  autoUpdate,
  safePolygon,
  FloatingPortal,
  useFloatingTree,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useMergeRefs,
  FloatingNode,
  FloatingTree,
  FloatingFocusManager,
} from '@floating-ui/react'
import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useRangy } from '@/features/contextMenu/hooks'
import {
  FloatingDropdownMenuSelectedItemState,
  IContextMenuItem,
} from '@/features/contextMenu/store'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import cloneDeep from 'lodash-es/cloneDeep'
import { ContextMenuIcon } from '@/features/contextMenu'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { useRecoilValue, useSetRecoilState } from 'recoil'
interface MenuItemProps {
  label: string
  menuItem: IContextMenuItem
  disabled?: boolean
}

// eslint-disable-next-line react/display-name
export const DropdownMenuItem = React.forwardRef<any, MenuItemProps>(
  ({ label, disabled, menuItem, ...props }, ref) => {
    const { hoverId } = useRecoilValue(FloatingDropdownMenuSelectedItemState)
    const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
    const { lastSelectionRanges, rangy } = useRangy()
    const [running, setRunning] = useState(false)
    useEffect(() => {
      if (running) {
        const actions = menuItem.data.actions
        if (actions && actions.length > 0) {
          const setActions = cloneDeep(actions)
          const isSetSuccess = setShortCuts(setActions)
          isSetSuccess &&
            runShortCuts()
              .then()
              .catch()
              .finally(() => {
                rangy?.contextMenu.close()
                rangy?.contextMenu.resetActiveElement()
                setRunning(false)
              })
        }
      }
    }, [lastSelectionRanges, running])
    return (
      <Box
        {...props}
        data-id={menuItem.id}
        // aria-disabled={disabled}
        className={`floating-context-menu-item ${
          menuItem.id === hoverId ? 'floating-context-menu-item--active' : ''
        }`}
        tabIndex={menuItem.id === hoverId ? 0 : -1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 1,
          height: '28px',
          fontSize: '14px',
          width: '100%',
          cursor: 'pointer',
          '&.floating-context-menu-item--active': {
            background: 'rgba(55, 53, 47, 0.08)',
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
            background: 'rgba(55, 53, 47, 0.08)',
            '& .floating-context-menu-item__footer-icon': {
              display: 'flex',
            },
          },
        }}
        ref={ref}
        component={'div'}
        role="menuitem"
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          if (!running) {
            setRunning(true)
          }
          props?.onClick?.(event)
        }}
        onFocus={(event) => {
          props?.onFocus?.(event)
        }}
        onMouseUp={(event) => {
          event.stopPropagation()
          event.preventDefault()
          props?.onMouseUp?.(event)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.stopPropagation()
            event.preventDefault()
          }
          props?.onKeyDown?.(event)
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
          color={'inherit'}
          width={0}
          noWrap
          flex={1}
        >
          {menuItem.text}
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
              sx={{ color: 'rgba(55, 53, 47, 0.45)', fontSize: 16 }}
            />
          ) : menuItem?.data?.icon ? (
            <ContextMenuIcon
              size={16}
              icon={menuItem.data.icon}
              sx={{ color: 'rgba(55, 53, 47, 0.45)' }}
            />
          ) : null}
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
  zIndex?: number
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
      customOpen = false,
      ...props
    },
    forwardedRef,
  ) => {
    const tree = useFloatingTree()
    const nodeId = useFloatingNodeId()
    const parentId = useFloatingParentNodeId()
    const updateHoverMenuId = useSetRecoilState(
      FloatingDropdownMenuSelectedItemState,
    )
    const isNested = parentId != null
    const [isOpen, setIsOpen] = React.useState(
      customOpen ? referenceElementOpen : false,
    )
    useEffect(() => {
      setTimeout(() => {
        setIsOpen(referenceElementOpen)
      }, 1)
    }, [referenceElementOpen])
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
    const [allowHover, setAllowHover] = React.useState(false)
    const listItemsRef = React.useRef<Array<any | null>>([])
    const listContentRef = React.useRef(
      React.Children.map(children, (child) =>
        React.isValidElement(child) ? child.props.label : null,
      ) as Array<string | null>,
    )
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
      placement: isNested ? 'right-start' : 'bottom-start',
      middleware: [
        offset({
          mainAxis: isNested ? 0 : 4,
          alignmentAxis: isNested ? -4 : 0,
        }),
        flip({
          fallbackPlacements: isNested
            ? ['right', 'left', 'bottom', 'top']
            : ['bottom', 'top', 'right', 'left'],
        }),
        shift(),
      ],
      whileElementsMounted: !isNested ? autoUpdate : undefined,
    })

    const hover = useHover(context, {
      enabled: isNested && allowHover,
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
    const listNavigation = useListNavigation(context, {
      listRef: listItemsRef,
      activeIndex,
      nested: isNested,
      onNavigate: (index) => {
        if (index === null) {
          updateHoverMenuId((prev) => {
            return {
              ...prev,
              hoverId: null,
            }
          })
          console.log(nodeId, index, parentId, 'onNavigateonNavigateonNavigate')
        } else {
          console.log(nodeId, index, parentId, 'onNavigateonNavigateonNavigate')
          const hoverId =
            listItemsRef.current?.[index]?.getAttribute('data-id') || null
          updateHoverMenuId((prev) => {
            return {
              ...prev,
              hoverId,
            }
          })
        }
        setActiveIndex(index)
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
        setIsOpen(false)
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
    }, [tree, nodeId, parentId])

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
    console.log(children)
    const referenceRef = useMergeRefs([refs.setReference, forwardedRef])
    return (
      <FloatingNode id={nodeId}>
        {referenceElement ? (
          React.isValidElement(referenceElement) &&
          React.cloneElement(referenceElement, {
            ref: referenceRef,
            ...getReferenceProps({
              ...props,
              className: `${isNested ? 'MenuItem' : 'RootMenu'}`,
              onClick(event) {
                event.stopPropagation()
              },
              onKeyUp(event) {
                event.stopPropagation()
              },
              ...(isNested && {
                // Indicates this is a nested <Menu /> acting as a <MenuItem />.
                role: 'menuitem',
              }),
            }),
          })
        ) : (
          <button
            ref={referenceRef}
            data-open={isOpen ? '' : undefined}
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
          >
            {label}{' '}
            {isNested && (
              <span aria-hidden style={{ marginLeft: 10 }}>
                ➔
              </span>
            )}
          </button>
        )}
        <FloatingPortal root={root}>
          {isOpen && (
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
                  p: 1,
                  outline: 'none!important',
                  width: 400,
                  maxHeight: 320,
                  overflowY: 'auto',
                  border: '1px solid rgb(237,237,236)',
                  background: 'white',
                  borderRadius: '6px',
                  boxShadow:
                    'rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
                  '& *': {
                    outline: 'none!important',
                  },
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
                          if (allowHover && isOpen) {
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
