import React, { FC, useState } from 'react'
import { SxProps } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import { Radio } from '@mui/material'
import FormControlLabel from '@mui/material/FormControlLabel'

export type RadioCardGroupOption = {
  label: string
  value: string
  image?: string
}

export interface RadioCardGroupProps {
  options: RadioCardGroupOption[]
  maxWidth: number
  defaultValue?: string
  onChange?: (value: string) => void
  sx?: SxProps
}

const RadioCardGroup: FC<RadioCardGroupProps> = (props) => {
  const { options, maxWidth, defaultValue, onChange, sx } = props
  const [selectedValue, setSelectedValue] = useState<string>(
    () => defaultValue || options[0].value,
  )
  const handleChange = (newValue: string) => {
    setSelectedValue(newValue)
    onChange?.(newValue)
  }
  return (
    <Stack direction={'row'} alignItems={'stretch'} gap={3} sx={{ ...sx }}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value
        return (
          <Stack
            key={option.value}
            sx={{
              borderRadius: '4px',
              border: '1px solid',
              borderColor: 'customColor.borderColor',
              maxWidth,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgb(32, 33, 36)'
                  : 'rgb(255,255,255)',
              flex: '1 1 0',
              cursor: 'pointer',
              ...(isSelected && {
                borderColor: 'primary.main',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgb(56, 56, 56)'
                    : 'rgb(235, 227, 345)',
              }),
            }}
            onClick={() => {
              handleChange(option.value)
            }}
          >
            <FormControlLabel
              sx={{ m: 0 }}
              value={option.value}
              control={<Radio checked={isSelected} sx={{ p: 1 }} />}
              label={option.label}
            />
            {option.image && (
              <Stack
                sx={{
                  p: 1,
                  '& img': {
                    width: '100%',
                    height: 'auto',
                    boxShadow: '0px 1px 7px 2px rgba(0, 0, 0, 0.10)',
                    // disable image dragging
                    userSelect: 'none',
                    userDrag: 'none',
                    pointerEvents: 'none',
                  },
                }}
              >
                <img src={option.image} alt={option.label} />
              </Stack>
            )}
          </Stack>
        )
      })}
    </Stack>
  )
}
export default RadioCardGroup