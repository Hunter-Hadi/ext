import FormControlLabel, { type FormControlLabelProps } from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import React, { type FC, memo } from 'react';

import { useChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'
import { IChromeExtensionButtonSettingKey } from '@/background/utils/chromeExtensionStorage/type';

interface ISettingPromptsPositionSwitchProps extends Omit<FormControlLabelProps, 'control'> { 
  buttonKey: IChromeExtensionButtonSettingKey;
}

const SettingPromptsPositionSwitch: FC<ISettingPromptsPositionSwitchProps> = ({ buttonKey, onChange, ...restProps }) => {
  const {
    buttonSettings,
    updateButtonSettings,
  } = useChromeExtensionButtonSettings()
  return <FormControlLabel
    control={<Switch />}
    onChange={async (event, checked) => {
      if (buttonSettings?.[buttonKey]) {
        await updateButtonSettings(
          buttonKey,
          {
            ...buttonSettings[buttonKey],
            contextMenuPosition: checked ? 'end' : 'start',
          },
          true,
        )
      }
      onChange && onChange(event, checked)
    }} 
    {...restProps}
  />
}

export default memo(SettingPromptsPositionSwitch);