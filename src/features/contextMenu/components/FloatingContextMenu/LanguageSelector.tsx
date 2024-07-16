import { Placement } from '@floating-ui/react'
import {
  Box,
  Button,
  Grow,
  MenuItem,
  MenuList,
  Popper,
  Typography,
} from '@mui/material'
import React, {
  FC,
  SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import {
  getMaxAIFloatingContextMenuRootElement,
  getMaxAISidebarRootElement,
} from '@/utils'
import { LANGUAGES_OPTIONS } from '@/utils/staticData'

const LanguageSelector: FC<{
  defaultValue?: string
  placement?: Placement
  onChangeLanguage?: (lang: string) => void
  inSidebar?: boolean
}> = ({
  defaultValue = '',
  placement = 'top-start',
  onChangeLanguage,
  inSidebar,
}) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(() => {
    return (
      LANGUAGES_OPTIONS.find((op) => op.value === defaultValue)?.value ||
      LANGUAGES_OPTIONS[0].value
    )
  })

  useLayoutEffect(() => {
    if (defaultValue) {
      setValue(defaultValue)
    }
  }, [defaultValue])

  const anchorRef = useRef<HTMLButtonElement>(null)
  const label = useMemo(
    () =>
      LANGUAGES_OPTIONS.find((op) => op.value === value)?.label ||
      LANGUAGES_OPTIONS[0].label,
    [value],
  )
  const container = useMemo(
    () =>
      (inSidebar
        ? getMaxAISidebarRootElement()
        : getMaxAIFloatingContextMenuRootElement()) || document.body,
    [inSidebar],
  )

  const onSelect = (selectedValue: string) => {
    if (value === selectedValue) return

    const option = LANGUAGES_OPTIONS.find((op) => op.value === selectedValue)
    if (!option) {
      return
    }

    onChangeLanguage?.(option.value)

    setValue(option.value)
    setOpen(false)
  }

  const handleClose = (event: Event | SyntheticEvent) => {
    if (
      event.target &&
      anchorRef.current?.contains(event.target as HTMLElement)
    ) {
      return
    }
    setOpen(false)
  }
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const mouseEventHandler = (event: MouseEvent) => {
      if (!boxRef.current) return

      const languagesCard = boxRef.current

      const rect = languagesCard.getBoundingClientRect()
      const x = (event as MouseEvent).clientX
      const y = (event as MouseEvent).clientY
      if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
        // 点击在卡片内部
        return
      }
      handleClose(event)
      event.stopPropagation()
    }
    document.addEventListener('mousedown', mouseEventHandler)
    return () => {
      document.removeEventListener('mousedown', mouseEventHandler)
    }
  }, [open, container])

  return (
    <Box>
      <Button
        ref={anchorRef}
        onClick={() => setOpen(!open)}
        sx={{
          padding: '4px',
          borderRadius: '4px',
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#3B3D3E' : '#E9E9EB'),
        }}
        disableRipple
      >
        <ContextMenuIcon
          icon={'Language'}
          sx={{
            color: 'text.secondary',
            fontSize: '16px',
          }}
        ></ContextMenuIcon>

        <Typography
          mx={0.5}
          fontSize={14}
          lineHeight={1.4}
          color='text.secondary'
          sx={{
            userSelect: 'none',
          }}
        >
          {label}
        </Typography>

        <ContextMenuIcon
          icon={'ExpandMore'}
          sx={{
            color: 'text.secondary',
            fontSize: '16px',
          }}
        />
      </Button>

      <Popper
        id='popper-language-selector'
        open={open}
        anchorEl={anchorRef.current}
        placement={placement}
        transition
        modifiers={[
          {
            name: 'RTLSupport',
            enabled:
              document.querySelector('body')?.getAttribute('dir') === 'rtl',
            phase: 'main',
            fn({ state }: any) {
              if (state.modifiersData.popperOffsets) {
                const referenceEndX =
                  state.rects.reference.x + state.rects.reference.width
                const popperX = referenceEndX - state.rects.popper.width
                if (popperX > 0) {
                  state.modifiersData.popperOffsets.x = popperX
                }
              }
            },
          },
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
        container={container}
      >
        {({ TransitionProps }) => {
          return (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom-start' ? 'left top' : 'left bottom',
              }}
            >
              <Box
                ref={boxRef}
                component={'div'}
                sx={{
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'customColor.borderColor',
                  boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.16)',
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  bgcolor: (t) =>
                    t.palette.mode === 'dark' ? 'rgba(61, 61, 61, 1)' : '#fff',
                }}
              >
                <MenuList
                  // id={'maxai-language-selector-menu'}
                  // aria-labelledby='maxai-language-selector-menu'
                  sx={{
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    flexShrink: 0,
                    borderRight: '1px solid',
                    borderColor: 'customColor.borderColor',
                    py: 0,
                    maxHeight: 290,
                  }}
                >
                  {LANGUAGES_OPTIONS.map((op) => (
                    <MenuItem
                      key={op.value}
                      selected={value === op.value}
                      onClick={() => onSelect(op.value)}
                      sx={{
                        color: 'text.primary',
                        fontSize: '16px',
                      }}
                    >
                      {op.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Box>
            </Grow>
          )
        }}
      </Popper>
    </Box>
  )
}

export default LanguageSelector
