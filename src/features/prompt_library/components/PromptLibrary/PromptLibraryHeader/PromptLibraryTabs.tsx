import styled from '@emotion/styled'
import { Box, TabsProps, Theme } from '@mui/material'
import Tabs, { tabsClasses } from '@mui/material/Tabs'
import Tab, { tabClasses } from '@mui/material/Tab'
import { buttonBaseClasses } from '@mui/material/ButtonBase'
import React, { FC } from 'react'
import FavoriteIcon from '@mui/icons-material/Favorite'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'

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
        color: isDark ? '#fff' : 'rgba(0, 0, 0, 0.6)',
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
  const { activeTab, updateActiveTab } = usePromptLibraryParameters()
  return (
    <Box flex={1} flexBasis={'100%'}>
      <CustomTabs
        value={activeTab}
        variant="fullWidth"
        onChange={(event, newValue) => {
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
          iconPosition="start"
          value={'Favorites'}
          label="Favorites"
        />
        <Tab value={'Public'} label="Public" />
        <Tab value={'Own'} label="Own" />
      </CustomTabs>
    </Box>
  )
}
export default PromptLibraryTabs
