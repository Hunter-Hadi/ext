import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import Modal from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import FeatureAIResponseLanguageCard from '@/pages/settings/pages/language/FeatureAIResponseLanguageCard'
import { chromeExtensionClientOpenPage } from '@/utils'
import { isMaxAISettingsPage } from '@/utils/dataHelper/websiteHelper'

const AIResponseLanguageEditor: FC<{
  checked: boolean
  onChange: (checked: boolean) => void
}> = (props) => {
  const { checked, onChange } = props

  const { t } = useTranslation(['prompt_editor'])

  const [open, setOpen] = useState(false)

  return (
    <Stack spacing={1}>
      <Stack direction={'row'} alignItems='center'>
        <Typography variant={'body1'}>
          {t('prompt_editor:ai_response_language__title')}
        </Typography>
      </Stack>
      <FormControlLabel
        sx={{
          p: '4px 16px',
          borderRadius: '4px',
          justifyContent: 'space-between',
          flexDirection: 'row-reverse',
          border: `1px solid`,
          borderColor: 'customColor.borderColor',
        }}
        control={<Switch checked={checked} />}
        label={
          <Stack direction={'row'} alignItems='center' gap={1}>
            <Typography variant={'body1'}>
              {t('prompt_editor:ai_response_language__settings__label_1')}
            </Typography>
            <Link
              underline={'always'}
              color={'text.primary'}
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                if (isMaxAISettingsPage()) {
                  setOpen(true)
                } else {
                  chromeExtensionClientOpenPage({
                    key: 'options',
                    query: '?id=ai-response-language#/language',
                  })
                }
              }}
            >
              <Typography variant={'body1'}>
                {t('prompt_editor:ai_response_language__settings__label_2')}
              </Typography>
            </Link>
          </Stack>
        }
        value={checked}
        onChange={(_, newChecked) => {
          onChange(newChecked)
        }}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: ' 0px 4px 16px rgba(0, 0, 0, 0.08);',
            width: '80%',
            maxWidth: '1200px',
            p: 2,
          }}
        >
          <FeatureAIResponseLanguageCard />
        </Paper>
      </Modal>
    </Stack>
  )
}

export default AIResponseLanguageEditor
