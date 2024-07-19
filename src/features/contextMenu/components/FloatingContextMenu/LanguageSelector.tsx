import { Placement } from '@floating-ui/react'
import {
  Autocomplete,
  Box,
  Button,
  Popper,
  TextField,
  Typography,
} from '@mui/material'
import { autocompleteClasses } from '@mui/material/Autocomplete'
import { inputBaseClasses } from '@mui/material/InputBase'
import { inputLabelClasses } from '@mui/material/InputLabel'
import { svgIconClasses } from '@mui/material/SvgIcon'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import {
  getMaxAIFloatingContextMenuRootElement,
  getMaxAISidebarRootElement,
} from '@/utils'
import { LANGUAGES_OPTIONS } from '@/utils/staticData'

function filterOptions(options: any[], { inputValue }: any) {
  return options.filter((option) => {
    const label = option.label.toLowerCase()
    const value = option.value.toLowerCase()
    const input = inputValue.toLowerCase()
    return label.includes(input) || value.includes(input)
  })
}

const LanguageSelector: FC<{
  defaultValue?: string
  placement?: Placement
  onChangeLanguage?: (lang: string) => void
  inSidebar?: boolean
}> = ({
  defaultValue = '',
  placement = 'top-start',
  inSidebar,
  onChangeLanguage,
}) => {
  const { t } = useTranslation(['common', 'settings'])
  const [open, setOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return (
      LANGUAGES_OPTIONS.find((op) => op.value === defaultValue) ||
      LANGUAGES_OPTIONS[0]
    )
  })
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  useEffect(() => {
    const lang = LANGUAGES_OPTIONS.find((op) => op.value === defaultValue)
    if (lang && lang !== currentLanguage) {
      setCurrentLanguage(lang)
    }
  }, [])

  const container = useMemo(
    () =>
      (inSidebar
        ? getMaxAISidebarRootElement()
        : getMaxAIFloatingContextMenuRootElement()) || document.body,
    [inSidebar],
  )
  // const handleClose = (event: Event | SyntheticEvent) => {
  //   if (event.target && anchorEl?.contains(event.target as HTMLElement)) {
  //     return
  //   }
  //   setOpen(false)
  //   setPopperOpen(false)
  // }

  const boxRef = useRef<HTMLDivElement>(null)

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setOpen(true)
  }

  const handleChange = (newValue: { label: string; value: string }) => {
    setCurrentLanguage(newValue)
    onChangeLanguage?.(newValue.value)
  }

  const [popperOpen, setPopperOpen] = useState(false)

  useEffect(() => {
    setPopperOpen(true)
  }, [open])

  return (
    <Box>
      <Button
        onClick={handleOpen}
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
          {currentLanguage.label}
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
        anchorEl={anchorEl}
        placement={placement}
        container={container}
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
            flexDirection: 'column',
            bgcolor: (t) =>
              t.palette.mode === 'dark' ? 'rgba(61, 61, 61, 1)' : '#fff',
          }}
        >
          {open && (
            <Autocomplete
              open
              onClose={() => {
                setOpen(false)
                setPopperOpen(false)
              }}
              noOptionsText={t('common:no_options')}
              disableClearable
              value={currentLanguage}
              size={'small'}
              onKeyDownCapture={(event) => {
                if (
                  [
                    'ArrowUp',
                    'ArrowDown',
                    'ArrowLeft',
                    'ArrowRight',
                    'Enter',
                  ].includes(event.key)
                ) {
                  console.log('stopPropagation')
                  event.stopPropagation()
                }
              }}
              sx={{
                width: 160,
                [`.${inputLabelClasses.root}`]: {
                  fontSize: 16,
                },
                [`.${inputBaseClasses.root}`]: {
                  fontSize: 16,
                },
                [`.${inputBaseClasses.root} fieldset > legend`]: {
                  fontSize: 14,
                },
                [`.${autocompleteClasses.popupIndicator} .${svgIconClasses.root}`]:
                  {
                    fontSize: 24,
                  },
              }}
              slotProps={{
                popper: {
                  open: popperOpen,
                  disablePortal: true,
                },
                paper: {
                  sx: {
                    fontSize: 16,
                    '& ul': {
                      maxHeight: '260px',
                    },
                  },
                },
              }}
              autoHighlight
              getOptionLabel={(option) => option.label}
              options={LANGUAGES_OPTIONS}
              onChange={(_, newValue) => {
                handleChange(newValue)
              }}
              onKeyDown={(event) => {
                event.stopPropagation()
              }}
              filterOptions={filterOptions}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t(
                    'settings:feature_card__ai_response_language__field_ai_response_language__label',
                  )}
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: 'new-password', // disable autocomplete and autofill
                    autoFocus: true,
                  }}
                />
              )}
            />
          )}
        </Box>
      </Popper>
    </Box>
  )
}

export default LanguageSelector
