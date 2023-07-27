import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useState } from 'react'
import FormControl from '@mui/material/FormControl'
import Switch from '@mui/material/Switch'
import CloseAlert from '@/components/CloseAlert'
import useCommands from '@/hooks/useCommands'
import { newShortcutHint } from '@/features/contextMenu/utils/selectionHelper'
import { usePrevious } from '@/hooks/usePrevious'
import Card from '@mui/material/Card'

const ShortcutHintSettings: FC<{
  defaultValue?: boolean
  onChange?: (value: boolean) => void
}> = ({ defaultValue, onChange }) => {
  const { floatingMenuShortCutKey } = useCommands()
  const shortHint = newShortcutHint(floatingMenuShortCutKey || '⌘I')
  const [checked, setChecked] = useState<boolean>(defaultValue ?? true)
  const prevChecked = usePrevious(checked)
  useEffect(() => {
    // skip first render
    if (prevChecked === undefined || prevChecked === checked) {
      return
    }
    onChange && onChange(checked)
  }, [checked])
  return (
    <Stack spacing={2}>
      <Typography
        fontSize={20}
        fontWeight={700}
        color={'text.primary'}
        component={'h2'}
        id={'shortcut-hint'}
      >
        Shortcut hint
      </Typography>
      <CloseAlert icon={<></>} severity={'info'}>
        <Stack spacing={1}>
          <Typography fontSize={14} color={'text.primary'}>
            Change visibility
          </Typography>
        </Stack>
      </CloseAlert>
      <FormControl size="small">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography>Hidden</Typography>
          <Switch
            defaultChecked={checked}
            onChange={(event) => {
              setChecked(event.target.checked)
            }}
          />
          <Typography>Visible</Typography>
        </Stack>
      </FormControl>
      <Card
        elevation={0}
        sx={{
          boxShadow: `0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09)`,
          borderRadius: '4px',
          px: 2,
          py: 1,
          height: '100px',
        }}
      >
        {checked && (
          <Typography color={'text.secondary'} fontSize={'14px'}>
            {shortHint}
          </Typography>
        )}
      </Card>
    </Stack>
  )
}
export default ShortcutHintSettings
