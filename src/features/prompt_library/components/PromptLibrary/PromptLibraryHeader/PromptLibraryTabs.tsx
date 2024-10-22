import styled from '@emotion/styled'
import FavoriteIcon from '@mui/icons-material/Favorite'
import Box from '@mui/material/Box'
import { buttonBaseClasses } from '@mui/material/ButtonBase'
import { Theme } from '@mui/material/styles'
import Tab, { tabClasses } from '@mui/material/Tab'
import Tabs, { tabsClasses, TabsProps } from '@mui/material/Tabs'
import React, { FC, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { webPageOpenMaxAIImmersiveChat } from '@/features/common/utils/postMessageToCRX'
import usePromptLibraryAuth from '@/features/prompt_library/hooks/usePromptLibraryAuth'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import { PromptLibraryRuntimeContext } from '@/features/prompt_library/store'

const CustomTabs = styled(({ ...props }: TabsProps) => <Tabs {...props} />)(
  ({ theme }) => {
    const t = theme as Theme
    const isDark = t.palette.mode === 'dark'
    return {
      '&': {
        // background: '#f00',
      },
      [`.${tabClasses.root}`]: {
        padding: '6px 16px',
        borderBottom: '1px solid',
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.08)',
        minHeight: 52,
      },
      [`.${tabClasses.root}.Mui-selected`]: {
        background: isDark ? '#3E3F4C' : 'rgba(0, 0, 0, 0.08)',
        color: isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)',
      },
      [`.${tabsClasses.indicator}`]: {
        backgroundColor: '#d8d8d8',
      },
      [`.${buttonBaseClasses.root}`]: {
        fontSize: '16px',
      },
    }
  },
)

/**
 * PromptLibrary的Tabs组件
 * @constructor
 */
const PromptLibraryTabs: FC = () => {
  const { t } = useTranslation(['prompt_library'])
  const { activeTab, updateActiveTab } = usePromptLibraryParameters()
  const { checkMaxAIChromeExtensionInstall } = usePromptLibraryAuth()
  const { promptLibraryRuntime } = useContext(PromptLibraryRuntimeContext)!
  return (
    <Box flex={1} flexBasis={'100%'}>
      <CustomTabs
        value={activeTab}
        variant='fullWidth'
        onChange={async (event, newValue) => {
          if (newValue !== 'Public' && promptLibraryRuntime === 'WebPage') {
            if (await checkMaxAIChromeExtensionInstall()) {
              // 跳转去ImmersiveChat
              webPageOpenMaxAIImmersiveChat(
                `?promptLibraryActiveTab=${newValue}`,
              )
            }
            return
          }
          updateActiveTab(newValue)
        }}
      >
        <Tab
          icon={
            <FavoriteIcon
              sx={{
                fontSize: '24px',
              }}
            />
          }
          iconPosition='start'
          value={'Favorites'}
          label={t('prompt_library:tab__favorites__title')}
        />
        <Tab value={'Public'} label={t('prompt_library:tab__public__title')} />
        <Tab value={'Own'} label={t('prompt_library:tab__own__title')} />
      </CustomTabs>
    </Box>
  )
}
export default PromptLibraryTabs
