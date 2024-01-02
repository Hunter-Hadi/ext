import Button from '@mui/material/Button'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { atom, useRecoilState } from 'recoil'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'

export const MaxAIMinimumHideState = atom({
  key: 'MaxAIMinimumHideState',
  default: false,
})
const MaxAISettingsMiniButton = () => {
  const [, setMaxAIMinimumHide] = useRecoilState(MaxAIMinimumHideState)
  const { t } = useTranslation(['common', 'client'])
  return (
    <TextOnlyTooltip
      arrow
      minimumTooltip
      title={t('client:quick_access__hide_button__title')}
      placement={'left'}
    >
      <Button
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          minWidth: 'unset',
          display: 'flex',
          boxShadow:
            '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09)',
          color: (t) =>
            t.palette.mode === 'dark'
              ? 'text.secondary'
              : 'rgba(255,255,255,.6)',
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(72, 72, 72, .6)!important'
              : 'rgba(0, 0, 0, .4)!important',
          '&:hover': {
            color: (t) =>
              t.palette.mode === 'dark'
                ? 'text.primary'
                : 'rgba(255,255,255,.87)',
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(72, 72, 72, .87)!important'
                : 'rgba(0, 0, 0, .6)!important',
          },
        }}
        onClick={(event) => {
          setMaxAIMinimumHide(true)
        }}
      >
        <ContextMenuIcon
          sx={{
            fontSize: '20px',
            color: 'inherit',
          }}
          icon={'Close'}
        />
      </Button>
    </TextOnlyTooltip>
  )
}
export default MaxAISettingsMiniButton
