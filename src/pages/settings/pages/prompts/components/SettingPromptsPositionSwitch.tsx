import FormControlLabel, {
  type FormControlLabelProps,
} from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import React, { type FC, memo } from 'react'
import { useRecoilState } from 'recoil'

import { useChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'
import { SettingPromptsEditButtonKeyAtom } from '@/pages/settings/pages/prompts/store'

interface ISettingPromptsPositionSwitchProps
  extends Omit<FormControlLabelProps, 'control'> {}

const SettingPromptsPositionSwitch: FC<ISettingPromptsPositionSwitchProps> = ({
  onChange,
  ...restProps
}) => {
  const { buttonSettings, updateButtonSettings } =
    useChromeExtensionButtonSettings()
  const [editButtonKey] = useRecoilState(SettingPromptsEditButtonKeyAtom)
  return (
    <FormControlLabel
      control={<Switch />}
      onChange={async (event, checked) => {
        if (editButtonKey && buttonSettings?.[editButtonKey]) {
          await updateButtonSettings(
            editButtonKey,
            {
              ...buttonSettings[editButtonKey],
              contextMenuPosition: checked ? 'end' : 'start',
            },
            true,
          )
        }
        onChange && onChange(event, checked)
      }}
      {...restProps}
    />
  )
}

export default memo(SettingPromptsPositionSwitch)
