import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import {
  DropdownMenu,
  LiteDropdownMenuItem,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { useSettingPromptsContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/context'

const TitleBar = () => {
  const { t } = useTranslation(['settings', 'common'])

  const { editNode } = useSettingPromptsContext()

  const isDisabled = !editNode.data.editable
  const modalTitle = useMemo(() => {
    if (editNode.data.type === 'group') {
      return isDisabled
        ? t('settings:feature_card__prompts__read_prompt_group__title')
        : editNode.id === ''
        ? t('settings:feature_card__prompts__new_prompt_group__title')
        : t('settings:feature_card__prompts__edit_prompt_group__title')
    } else {
      return isDisabled
        ? t('settings:feature_card__prompts__read_prompt__title')
        : editNode.id === ''
        ? t('settings:feature_card__prompts__new_prompt__title')
        : t('settings:feature_card__prompts__edit_prompt__title')
    }
  }, [editNode.data.type, editNode.id, isDisabled, t])

  return (
    <Stack
      direction="row"
      alignItems="center"
      borderBottom="1px solid"
      borderColor="customColor.borderColor"
      spacing={1}
      py={1}
      px={2}
    >
      <Typography variant="h6">{modalTitle}</Typography>

      <DropdownMenu
        defaultPlacement="bottom-end"
        zIndex={2147483630}
        hoverOpen
        menuSx={{
          width: 200,
        }}
        referenceElement={
          <Button
            variant="text"
            sx={{
              width: '36px',
              height: '36px',
              color: 'inherit',
              minWidth: 'unset',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'customColor.borderColor',
              ml: 'auto!important',
            }}
          >
            <ContextMenuIcon
              icon={'More'}
              sx={{ color: 'text.primary', fontSize: '16px' }}
            />
          </Button>
        }
      >
        <LiteDropdownMenuItem label={t('common:cancel')} onClick={() => {}} />
        <LiteDropdownMenuItem label={t('common:delete')} onClick={() => {}} />
      </DropdownMenu>

      <Button
        variant="contained"
        sx={{ borderRadius: '8px' }}
        onClick={() => {}}
      >
        {t('common:save')}
      </Button>
    </Stack>
  )
}

export default TitleBar
