import React, { FC } from 'react'
import { BaseSelect } from '@/components/select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'react-i18next'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import URLSearchEngine from '@/features/shortcuts/types/IOS_WF/URLSearchEngine'

export const SEARCH_ENGINE_OPTIONS: Array<{
  label: string
  value: URLSearchEngine
}> = [
  {
    value: 'sogou',
    label: 'Sogou Search',
  },
  {
    value: 'brave',
    label: 'Brave Search',
  },
  {
    value: 'yandex',
    label: 'Yandex Search',
  },
  // {
  //   value: 'duckduckgo',
  //   label: 'Duckduckgo Search',
  // },
  {
    value: 'naver',
    label: 'Naver Search',
  },
  {
    value: 'bing',
    label: 'Bing Search',
  },
  {
    value: 'yahoo',
    label: 'Yahoo Search',
  },
  {
    value: 'baidu',
    label: 'Baidu Search',
  },
  {
    value: 'google',
    label: 'Google Search',
  },
]

const SearchWithAISearchEngineSelector: FC = () => {
  const { sidebarSettings, updateSidebarSettings } = useSidebarSettings()
  const { t } = useTranslation(['common', 'client'])
  return (
    <BaseSelect
      displayLoading={false}
      MenuProps={{
        elevation: 0,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'left',
        },
        transformOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
        MenuListProps: {
          sx: {
            border: `1px solid`,
            borderColor: 'customColor.borderColor',
          },
        },
      }}
      sx={{ width: '100%' }}
      size={'small'}
      label={t(
        'client:sidebar__search_with_ai__advanced__search_engine__title',
      )}
      labelSx={{
        fontSize: 16,
      }}
      options={SEARCH_ENGINE_OPTIONS}
      value={sidebarSettings?.search?.searchEngine || 'google'}
      onChange={async (value) => {
        await updateSidebarSettings({
          search: {
            searchEngine: value as URLSearchEngine,
          },
        })
      }}
      labelProp={{
        p: 0,
        pointerEvents: 'auto!important',
      }}
      renderValue={(value) => {
        const option = SEARCH_ENGINE_OPTIONS.find(
          (item) => item.value === value,
        )
        return (
          <Stack
            sx={{ padding: '6px 0' }}
            direction={'row'}
            alignItems={'center'}
            spacing={1}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
          >
            <Typography
              component={'span'}
              fontSize={14}
              color={'text.primary'}
              textAlign={'left'}
              noWrap
            >
              {option?.label}
            </Typography>
          </Stack>
        )
      }}
      renderLabel={(value, option) => {
        return (
          <Tooltip
            placement={'left'}
            PopperProps={{
              sx: {
                zIndex: 2147483620,
              },
            }}
            componentsProps={{
              tooltip: {
                sx: {
                  border: '1px solid rgb(224,224,224)',
                  bgcolor: 'background.paper',
                  p: 1,
                },
              },
            }}
            title={undefined}
          >
            <Stack
              sx={{ padding: '6px 16px' }}
              width={'100%'}
              direction={'row'}
              alignItems={'center'}
              spacing={1}
            >
              <Typography
                component={'span'}
                fontSize={14}
                color={'text.primary'}
                textAlign={'left'}
                noWrap
              >
                {option.label}
              </Typography>
            </Stack>
          </Tooltip>
        )
      }}
    />
  )
}
export default SearchWithAISearchEngineSelector
