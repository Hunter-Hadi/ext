import React, { FC, useEffect, useMemo, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import uniqBy from 'lodash-es/uniqBy'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { AppSettingsState } from '@/store'
import { ChatGPTMessageState } from '@/features/sidebar/store'
import { setChromeExtensionSettings } from '@/background/utils'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { chromeExtensionClientOpenPage } from '@/utils'

const ArrowDropDownIconCustom = () => {
  return (
    <ArrowDropDownIcon
      sx={{
        color: 'text.secondary',
        fontSize: '16px',
        position: 'absolute',
        right: '8px',
        top: 'calc(50% - 8px)',
      }}
    />
  )
}

const ChatGPTPluginsSelector: FC = () => {
  const messages = useRecoilValue(ChatGPTMessageState)
  const [error, setError] = useState(false)
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const enabledPlugins = useMemo(() => {
    return appSettings.currentPlugins || []
  }, [appSettings.currentPlugins])
  const plugins = useMemo(() => {
    if (appSettings.plugins && appSettings.currentModel === 'gpt-4-plugins') {
      return uniqBy(appSettings.plugins, 'id').filter(
        (plugin) => plugin.user_settings.is_installed,
      )
    } else {
      return []
    }
  }, [appSettings.plugins, appSettings.currentModel])
  useEffect(() => {
    if (appSettings.currentModel === 'gpt-4-plugins') {
      // 过滤掉不存在的
      const filterIds = enabledPlugins.filter((id) => {
        return plugins.find((plugin) => plugin.id === id)
      })
      if (filterIds.length !== enabledPlugins.length) {
        setChromeExtensionSettings({
          currentPlugins: filterIds,
        })
      }
    }
  }, [plugins, enabledPlugins, appSettings.currentModel])
  const handleError = () => {
    // set error 1s
    setError(true)
    setTimeout(() => {
      setError(false)
    }, 1000)
  }
  return (
    <>
      {plugins.length > 0 ? (
        <FormControl size="small" sx={{ height: 40, maxWidth: 400 }} fullWidth>
          <InputLabel
            sx={{ fontSize: '16px' }}
            id={'ChatGPTPluginsSelectorLabel'}
          >
            <span style={{ fontSize: '16px' }}>
              {enabledPlugins.length > 0 ? 'Plugins' : 'No plugins enabled'}
            </span>
          </InputLabel>
          <Select
            sx={{
              height: 40,
              p: 0,
            }}
            value={appSettings.currentPlugins || []}
            multiple
            disabled={messages.length > 0}
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
              },
              transformOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
              },
              elevation: 0,
              MenuListProps: {
                sx: {
                  padding: 0,
                  width: 320,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    width: '6px',
                    borderRadius: '3px',
                    backgroundColor: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    borderRadius: '3px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                  },
                  position: 'relative',
                  border: `1px solid`,
                  borderColor: 'customColor.borderColor',
                },
              },
            }}
            onChange={async (e) => {
              // max 3 plugins
              if (e.target.value.length > 3) {
                handleError()
                return
              }
              const value = e.target.value as string[]
              setAppSettings((appSettings) => {
                return {
                  ...appSettings,
                  currentPlugins: value,
                }
              })
              await setChromeExtensionSettings({
                currentPlugins: value,
              })
            }}
            renderValue={(selected) => {
              return (
                <Stack
                  direction={'row'}
                  alignItems={'center'}
                  width={320}
                  spacing={0.5}
                >
                  {selected.length > 0 ? (
                    selected.map((value) => {
                      const plugin = plugins.find(
                        (plugin) => plugin.id === value,
                      )
                      const name =
                        plugin?.manifest?.name_for_human ||
                        plugin?.manifest?.name_for_model ||
                        plugin?.namespace
                      const src = plugin?.manifest?.logo_url
                      if (plugin && src) {
                        return (
                          <img
                            key={plugin.id}
                            width={16}
                            height={16}
                            alt={name}
                            src={src}
                          />
                        )
                      }
                      return null
                    })
                  ) : (
                    <Typography
                      textAlign={'left'}
                      noWrap
                      fontSize={'14px'}
                      color={'text.primary'}
                    >
                      No plugins enabled
                    </Typography>
                  )}
                </Stack>
              )
            }}
            IconComponent={ArrowDropDownIconCustom}
            labelId={'ChatGPTPluginsSelectorLabel'}
            label={'Model'}
          >
            <Box
              component={'div'}
              className={error ? 'error' : ''}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                bgcolor: 'background.paper',
                position: 'sticky',
                top: 0,
                zIndex: 1,
                justifyContent: 'center',
                fontSize: '14px',
                color: 'text.primary',
                '&.error': {
                  backgroundColor: 'error.light',
                  color: 'error.dark',
                },
              }}
            >
              {enabledPlugins.length}/3 Enabled
            </Box>
            {plugins.map((plugin) => {
              const pluginName =
                plugin.manifest?.name_for_human ||
                plugin.manifest?.name_for_model ||
                plugin.namespace
              const pluginDescription =
                plugin.manifest?.description_for_human ||
                plugin.manifest?.description_for_model ||
                ''
              return (
                <MenuItem key={plugin.id} value={plugin.id} sx={{ p: 0 }}>
                  <Tooltip
                    placement={'right-start'}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          border: '1px solid rgb(245,245,245)',
                          bgcolor: 'background.paper',
                          p: 1,
                        },
                      },
                    }}
                    title={
                      <Stack width={'320px'}>
                        {plugin.manifest?.logo_url && (
                          <img
                            width={70}
                            height={70}
                            alt={pluginName + ' logo'}
                            src={plugin.manifest.logo_url}
                            style={{ flexShrink: 0 }}
                          />
                        )}
                        <Stack
                          width={'100%'}
                          direction={'row'}
                          alignItems={'center'}
                          spacing={1}
                          my={2}
                        >
                          <Typography
                            fontSize={'14px'}
                            color={'text.primary'}
                            textAlign={'left'}
                          >
                            {pluginName}
                          </Typography>
                        </Stack>
                        <Typography
                          fontSize={'12px'}
                          color={'text.secondary'}
                          textAlign={'left'}
                        >
                          {pluginDescription}
                        </Typography>
                      </Stack>
                    }
                  >
                    <Stack
                      width={320}
                      sx={{ padding: '0 16px' }}
                      direction={'row'}
                      alignItems={'center'}
                      spacing={1}
                    >
                      {plugin.manifest?.logo_url && (
                        <img
                          width={24}
                          height={24}
                          alt={pluginName + ' logo'}
                          src={plugin.manifest.logo_url}
                          style={{ flexShrink: 0 }}
                        />
                      )}
                      <Typography
                        flex={1}
                        width={0}
                        textAlign={'left'}
                        noWrap
                        fontSize={'14px'}
                        color={'text.primary'}
                      >
                        {pluginName}
                      </Typography>
                      <Checkbox
                        sx={{ flexShrink: 0 }}
                        checked={appSettings.currentPlugins?.includes(
                          plugin.id,
                        )}
                      />
                    </Stack>
                  </Tooltip>
                </MenuItem>
              )
            })}
            <MenuItem
              value={''}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
              sx={{ p: '0!important' }}
            >
              <Stack
                width={320}
                sx={{ padding: '12px 30px 12px 16px' }}
                direction={'row'}
                alignItems={'center'}
                spacing={1}
                onClick={async (event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  await chromeExtensionClientOpenPage({
                    key: 'chatgpt',
                  })
                }}
              >
                <Typography
                  flex={1}
                  width={0}
                  textAlign={'left'}
                  noWrap
                  fontSize={'14px'}
                  color={'text.primary'}
                >
                  Plugin store
                </Typography>
                <OpenInNewIcon
                  sx={{ color: 'text.primary', fontSize: '16px' }}
                />
              </Stack>
            </MenuItem>
          </Select>
        </FormControl>
      ) : null}
    </>
  )
}
export { ChatGPTPluginsSelector }
