import FormControlLabel from '@mui/material/FormControlLabel'
import { SxProps } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'

import useSearchWithAISettings from '../hooks/useSearchWithAISettings'

interface IProps {
  sx?: SxProps
  onChange?: (checked: boolean) => void
}

const SearchWithAIWebAccessToggle: FC<IProps> = ({ sx, onChange }) => {
  const { searchWithAISettings, setSearchWithAISettings } =
    useSearchWithAISettings()

  const webAccessPrompt = searchWithAISettings.webAccessPrompt

  return (
    <FormControlLabel
      sx={{
        m: 0,
        ...sx,
      }}
      checked={webAccessPrompt}
      onChange={(e: any) => {
        const checked = e.target.checked
        setSearchWithAISettings({
          webAccessPrompt: checked,
        })
        onChange && onChange(checked)
      }}
      control={<Switch color='primary' size='small' sx={{ mr: 0.5 }} />}
      label={
        <Typography fontSize={14} lineHeight={'20px'}>
          Web access
        </Typography>
      }
      labelPlacement='end'
    />
  )
}

export default SearchWithAIWebAccessToggle
