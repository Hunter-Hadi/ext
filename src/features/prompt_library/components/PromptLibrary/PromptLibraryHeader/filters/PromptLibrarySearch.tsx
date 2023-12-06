import React, { FC, useCallback, useMemo, useRef } from 'react'
import TextField from '@mui/material/TextField'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import snackNotifications from '@/utils/globalSnackbar'
import useCurrentBreakpoint from '@/features/sidebar/hooks/useCurrentBreakpoint'
import { SxProps } from '@mui/material/styles'
import { formControlClasses } from '@mui/material/FormControl'
import { useTranslation } from 'react-i18next'

const PromptLibrarySearch: FC = () => {
  const { t } = useTranslation(['prompt_library'])
  const { searchQuery, updateSearchQuery } = usePromptLibraryParameters()
  const inputTimer = useRef<number | null>(null)
  const searchValue = useRef<string | null>(null)
  const handleDoSearch = useCallback(
    (event?: any) => {
      const value = searchValue.current
      event?.stopPropagation()
      if (value !== null && value !== '' && value.length <= 2) {
        // 解析失败报错显示错误提示
        snackNotifications.warning('Enter at least 3 characters to search.', {
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        })
        return
      }
      updateSearchQuery(value || '')
    },
    [searchQuery],
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
  const currentBreakpoint = useCurrentBreakpoint()
  const memoSx = useMemo(() => {
    const computedSx: SxProps = {
      [`&.${formControlClasses.root}`]: {
        width:
          currentBreakpoint === 'xs'
            ? '100%'
            : currentBreakpoint === 'sm' || currentBreakpoint === 'md'
            ? 'calc(50% - 8px)'
            : '220px',
      },
    }
    return computedSx
  }, [currentBreakpoint])
  return (
    <TextField
      defaultValue={searchQuery}
      label={t('prompt_library:filters__query__placeholder')}
      variant="outlined"
      size="small"
      sx={memoSx}
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
        sx: { height: 44, fontSize: '16px' },
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleDoSearch} edge="end">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}
export default PromptLibrarySearch