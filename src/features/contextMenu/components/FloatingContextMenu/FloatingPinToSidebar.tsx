import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { SxProps, Theme } from '@mui/material/styles'
import React, { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import {
  DropdownMenu,
  LiteDropdownMenuItem,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'

import { PinToSidebarState } from '../../store'

const selectedSx: SxProps<Theme> = {
  bgcolor: (t) =>
    t.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(55, 53, 47, 0.08)',
}

const ContextMenuPinToSidebarButton: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { t } = useTranslation(['common', 'client'])
  const [loading, setLoading] = useState(true)
  const [root, setRoot] = useState<null | HTMLElement>(null)
  const [pinToSidebar, setPinToSidebar] = useRecoilState(PinToSidebarState)

  const handlePinToSidebar = (once = true) => {
    setPinToSidebar(
      once
        ? {
            always: false,
            once: true,
          }
        : {
            always: true,
            once: false,
          },
    )
  }

  useEffect(() => {
    if (root) {
      return
    }
    const rootEl = getMaxAIFloatingContextMenuRootElement()
    if (rootEl) {
      setRoot(rootEl)
    }
    setLoading(false)
  }, [])

  return (
    <AppLoadingLayout loading={loading}>
      {root && (
        <DropdownMenu
          defaultPlacement={'bottom-start'}
          defaultFallbackPlacements={['top-start']}
          hoverOpen
          zIndex={2147483610}
          label={''}
          root={root}
          menuSx={{
            width: 240,
          }}
          referenceElement={
            <Box
              sx={{
                alignSelf: 'end',
              }}
            >
              <Button
                size={'small'}
                variant={'text'}
                sx={{
                  width: '28px',
                  height: '28px',
                  color: 'inherit',
                  minWidth: 'unset',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'customColor.borderColor',
                  ...sx,
                }}
              >
                <ContextMenuIcon
                  icon={'More'}
                  sx={{ color: 'text.primary', fontSize: '16px' }}
                />
              </Button>
            </Box>
          }
        >
          <LiteDropdownMenuItem
            sx={pinToSidebar.always ? selectedSx : undefined}
            onClick={() => handlePinToSidebar(false)}
            label={t('client:floating_menu__always_pin_to_sidebar')}
          />
          <LiteDropdownMenuItem
            sx={pinToSidebar.once ? selectedSx : undefined}
            onClick={() => handlePinToSidebar(true)}
            label={t('client:floating_menu__always_pin_sidebar_title')}
          />
        </DropdownMenu>
      )}
    </AppLoadingLayout>
  )
}

export default ContextMenuPinToSidebarButton
