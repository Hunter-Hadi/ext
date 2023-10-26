import React, { FC } from 'react'
import { BaseSelect } from '@/components/select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'react-i18next'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import isNumber from 'lodash-es/isNumber'

export const SEARCH_RESULTS_OPTIONS: Array<{
  label: string
  value: number
}> = Array.from({ length: 10 }, (_, i) => i + 1).map((num) => ({
  value: num,
  label: `${num} result${num === 1 ? '' : 's'}`,
}))

const SearchWithAIMaxSearchResultsSelector: FC = () => {
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
        'client:sidebar__search_with_ai__advanced__search_results__title',
      )}
      labelSx={{
        fontSize: 16,
      }}
      options={SEARCH_RESULTS_OPTIONS}
      value={sidebarSettings?.search?.maxResultsCount || 6}
      onChange={async (value) => {
        await updateSidebarSettings({
          search: {
            maxResultsCount: isNumber(value) ? value : 6,
          },
        })
      }}
      labelProp={{
        p: 0,
        pointerEvents: 'auto!important',
      }}
      renderValue={(value) => {
        const option = SEARCH_RESULTS_OPTIONS.find(
          (item) => item.value === value,
        )
        return (
          <Stack
            sx={{ padding: '6px 0' }}
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
export default SearchWithAIMaxSearchResultsSelector
