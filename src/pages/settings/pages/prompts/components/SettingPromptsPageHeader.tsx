import styled from '@emotion/styled'
import Box from '@mui/material/Box'
import { buttonBaseClasses } from '@mui/material/ButtonBase'
import { Theme } from '@mui/material/styles'
import Tab, { tabClasses } from '@mui/material/Tab'
import Tabs, { tabsClasses, type TabsProps } from '@mui/material/Tabs'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

export type SettingPromptsPageHeaderTabKey =
  | 'CONTEXT_MENU'
  | 'INSTANT_REPLY'
  | 'SUMMARY'
  | 'SEARCH'

interface ISettingPromptsPageHeaderProps {
  activeTab: SettingPromptsPageHeaderTabKey
  setActiveTab: (tab: SettingPromptsPageHeaderTabKey) => void
}

const CustomTabs = styled(({ ...props }: TabsProps) => <Tabs {...props} />)(
  ({ theme }) => {
    const t = theme as Theme
    const isDark = t.palette.mode === 'dark'
    return {
      marginBottom: '-1px',
      [`.${tabClasses.root}`]: {
        padding: '16px 12px',
        color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.6)',
        border: '1px solid',
        borderBottom: '0',
        borderColor: isDark ? 'rgb(0, 0, 0, 0)' : 'rgba(245,246,247, 1)',
        borderRadius: '8px 8px 0px 0px',
        minHeight: 52,

        [`&.${tabClasses.selected}`]: {
          background: isDark ? 'rgb(32, 33, 36)' : 'rgba(255, 255, 255, 1)',
          color: isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)',
          borderColor: isDark
            ? t.palette?.customColor!.borderColor
            : 'rgba(0, 0, 0, 0.08)',
        },

        [`& + .${tabClasses.root}`]: {
          marginLeft: '8px',
        },
      },
      [`.${tabsClasses.indicator}`]: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        display: 'none',
      },
      [`.${buttonBaseClasses.root}`]: {
        fontSize: '18px',
      },
    }
  },
)

/**
 * Setting My own prompts 的 Header 组件
 * @constructor
 */
const SettingPromptsPageHeader: FC<ISettingPromptsPageHeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { t } = useTranslation(['settings'])
  return (
    <Box flex={1} flexBasis={'100%'}>
      <CustomTabs
        value={activeTab}
        onChange={(_, newValue) => {
          setActiveTab(newValue)
        }}
      >
        <Tab
          value={'CONTEXT_MENU'}
          label={t(
            'settings:feature_card__prompts__place_my_own_prompts__tab_title__context_menu',
          )}
        />
        <Tab
          value={'INSTANT_REPLY'}
          label={t(
            'settings:feature_card__prompts__place_my_own_prompts__tab_title__instant_reply',
          )}
        />
        <Tab
          value={'SUMMARY'}
          label={t(
            'settings:feature_card__prompts__place_my_own_prompts__tab_title__summary',
          )}
        />
        {/*  <Tab
          value={'SEARCH'}
          label={t(
            'settings:feature_card__prompts__place_my_own_prompts__tab_title__search',
          )}
        /> */}
      </CustomTabs>
    </Box>
  )
}

export default SettingPromptsPageHeader
