import styled from '@emotion/styled'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TabsProps,
  TextField,
  Theme,
} from '@mui/material'
import React, { FC, useCallback, useEffect, useRef } from 'react'

import { BaseSelect } from '@/components/select/BaseSelect'
import { usePromptCategories } from '@/features/prompt_library/hooks/usePromptCategories'
import usePromptLibraryAuth from '@/features/prompt_library/hooks/usePromptLibraryAuth'
import { IPromptListType } from '@/features/prompt_library/types'
import AppLoadingLayout from '@/components/AppLoadingLayout'

export const GrayTabs = styled(({ ...props }: TabsProps) => (
  <Tabs {...props} />
))(({ theme }) => {
  const t = theme as Theme
  const isDark = t.palette.mode === 'dark'
  return {
    '&': {
      // background: '#f00',
    },
    '.MuiTab-root': {
      padding: '6px 16px',
      borderBottom: '1px solid',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      minHeight: 52,
    },
    '.MuiTab-root.Mui-selected': {
      background: isDark ? '#3E3F4C' : 'rgba(0, 0, 0, 0.08)',
      color: isDark ? '#fff' : 'rgba(0, 0, 0, 0.6)',
    },
    '.MuiTabs-indicator': {
      backgroundColor: '#d8d8d8',
    },
  }
})

const PromptTagSelector: FC<{
  onLoaded?: () => void
}> = (props) => {
  const { onLoaded } = props
  const { checkAuthSync } = usePromptLibraryAuth()

  const {
    loaded,
    tabActive,
    categoryOptions,
    currentCategory,
    useCaseOptions,
    currentUseCase,
    searchKeyword,
    setTabActive,
    setSearchKeyword,
    setCurrentUseCase,
    setCurrentCategory,
  } = usePromptCategories({
    enableSearchParams: true,
  })

  const inputTimer = useRef<number | null>(null)
  const searchValue = useRef<string | null>(null)

  useEffect(() => {
    if (!loaded) return
    searchValue.current = searchKeyword
    onLoaded && onLoaded()
  }, [loaded, onLoaded, searchKeyword])

  const handleDoSearch = useCallback(
    (event?: any) => {
      const value = searchValue.current
      event?.stopPropagation()
      if (value !== null && value !== '' && value.length <= 2) {
        // 解析失败报错显示错误提示
        // snackNotifications.warning('Enter at least 3 characters to search.', {
        //   anchorOrigin: {
        //     vertical: 'top',
        //     horizontal: 'center',
        //   },
        // })
        return
      }
      setSearchKeyword(value)
    },
    [setSearchKeyword],
  )

  const startInputSearchTimer = useCallback(() => {
    if (inputTimer.current) {
      clearTimeout(inputTimer.current)
    }
    inputTimer.current = window.setTimeout(() => {
      if (searchValue.current && searchValue.current?.length >= 3) {
        handleDoSearch()
      } else if (searchValue.current === '') {
        handleDoSearch()
      }
    }, 600)
  }, [handleDoSearch])

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: IPromptListType,
  ) => {
    if (checkAuthSync()) {
      setTabActive(newValue)
    }
  }

  return (
    <Stack
      width={'100%'}
      direction={'row'}
      alignItems={'center'}
      flexWrap={'wrap'}
      gap={2}
    >
      <AppLoadingLayout loading={!loaded}>
        <Box flex={1} flexBasis={'100%'}>
          <GrayTabs
            value={tabActive}
            variant="fullWidth"
            onChange={handleTabChange}
          >
            <Tab
              icon={<FavoriteIcon />}
              iconPosition="start"
              value={'Favorites'}
              label="Favorites"
            />
            <Tab value={'Public'} label="Public" />
            <Tab value={'Own'} label="Own" />
          </GrayTabs>
        </Box>
        {tabActive === 'Public' && (
          <>
            <BaseSelect
              sx={{ height: 44 }}
              label={'Category'}
              options={categoryOptions}
              value={currentCategory?.value}
              MenuProps={{
                sx: {
                  maxHeight: '550px',
                },
              }}
              onChange={async (value: any, option: any) => {
                setCurrentCategory(option)
              }}
            />
            <BaseSelect
              sx={{ height: 44 }}
              label={'Use case'}
              options={useCaseOptions}
              value={currentUseCase?.value}
              MenuProps={{
                sx: {
                  maxHeight: '550px',
                },
              }}
              onChange={async (value, option) => {
                setCurrentUseCase(option)
              }}
            />
            <TextField
              defaultValue={searchKeyword}
              label="Search..."
              variant="outlined"
              size="small"
              sx={{
                width: 220,
                ml: {
                  xs: 'unset',
                  sm: 'auto',
                },
              }}
              onChange={(event: any) => {
                const value = event.target.value
                searchValue.current = value
                if (value === '' || value.length > 2) {
                  startInputSearchTimer()
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleDoSearch(event)
                }
              }}
              onBlur={handleDoSearch}
              InputProps={{
                sx: { height: 44 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleDoSearch} edge="end">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        )}
      </AppLoadingLayout>
    </Stack>
  )
}
export { PromptTagSelector }
