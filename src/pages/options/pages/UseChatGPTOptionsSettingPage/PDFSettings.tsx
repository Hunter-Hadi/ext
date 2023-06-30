import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import FormControl from '@mui/material/FormControl'
import Switch from '@mui/material/Switch'
import BulletList from '@/components/BulletList'
import CloseAlert from '@/components/CloseAlert'
import { PDFTooltip } from '@/pages/options/components/tooltipCollection'

const PDFSettings: FC<{
  defaultValue?: {
    enabled?: boolean
  }
  onChange?: (value: boolean) => void
}> = ({ defaultValue, onChange }) => {
  return (
    <Stack spacing={2}>
      <Stack direction={'row'} alignItems="center">
        <Typography
          fontSize={20}
          fontWeight={700}
          color={'text.primary'}
          component={'h2'}
          id={'pdf'}
        >
          PDF AI viewer
        </Typography>
        <PDFTooltip />
      </Stack>
      <CloseAlert icon={<></>} severity={'info'}>
        <Stack spacing={1}>
          <Typography fontSize={14} fontWeight={700} color={'text.primary'}>
            Benefits:
          </Typography>
          <BulletList
            textProps={{
              fontSize: 14,
            }}
            textList={[
              `Ability to select text in any PDF files and use prompts on them.`,
              `Enhanced PDF viewer features compared to the browser's built-in viewer.`,
            ]}
          />
          <Typography fontSize={14} fontWeight={700} color={'text.primary'}>
            Caveats:
          </Typography>
          <BulletList
            textProps={{
              fontSize: 14,
            }}
            textList={[
              `Our PDF AI viewer only works with local PDF files at the moment.`,
              `Support for online PDF files is coming soon.`,
            ]}
          />
        </Stack>
      </CloseAlert>
      <FormControl size="small">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography>Disabled</Typography>
          <Switch
            defaultChecked={defaultValue?.enabled}
            onChange={(event) => {
              onChange && onChange(event.target.checked)
            }}
          />
          <Typography>Enabled</Typography>
        </Stack>
      </FormControl>
    </Stack>
  )
}
export default PDFSettings
