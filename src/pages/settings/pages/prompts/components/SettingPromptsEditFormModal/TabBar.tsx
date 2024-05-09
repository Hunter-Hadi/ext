import styled from '@emotion/styled'
import Box from '@mui/material/Box'
import { buttonBaseClasses } from '@mui/material/ButtonBase'
import { Theme } from '@mui/material/styles'
import Tab, { tabClasses } from '@mui/material/Tab'
import Tabs, { tabsClasses, type TabsProps } from '@mui/material/Tabs'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

const CustomTabs = styled(({ ...props }: TabsProps) => <Tabs {...props} />)(
  ({ theme }) => {
    const t = theme as Theme
    const isDark = t.palette.mode === 'dark'
    return {
      marginBottom: '-1px',
      background: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      padding: '2px',
      minHeight: '40px',

      [`.${tabClasses.root}`]: {
        boxSizing: 'border-box',
        width: '120px',
        minHeight: '40px',
        height: '40px',
        color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.6)',
        borderRadius: '8px',
        lineHeight: 'auto',

        [`&.${tabClasses.selected}`]: {
          background: isDark ? 'rgb(32, 33, 36)' : 'rgba(255, 255, 255, 1)',
          color: isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)',
          borderColor: isDark
            ? t.palette?.customColor!.borderColor
            : 'rgba(0, 0, 0, 0.08)',
        },
      },
      [`.${tabsClasses.indicator}`]: {
        display: 'none',
      },
      [`.${buttonBaseClasses.root}`]: {
        fontSize: '16px',
      },
    }
  },
)

const TabBar: FC<TabsProps> = (props) => {
  const { t } = useTranslation(['prompt_editor'])
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <CustomTabs {...props}>
        <Tab label={t('prompt_editor:configure_panel__title')} />
        <Tab label={t('prompt_editor:prompt_panel__title')} />
      </CustomTabs>
    </Box>
  )
}

export default TabBar
