import React, { FC, useEffect, useMemo, useState } from 'react'
import { IVisibilitySetting } from '@/background/types/Settings'
import Stack from '@mui/material/Stack'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Typography from '@mui/material/Typography'
import DomainSelect from '@/components/select/DomainSelect'
import uniq from 'lodash-es/uniq'
import { domain2Favicon } from '@/utils'
import IconButton from '@mui/material/IconButton'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { SxProps } from '@mui/material/styles'
import cloneDeep from 'lodash-es/cloneDeep'
import { useFocus } from '@/hooks/useFocus'
import { getChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'
import isEqual from 'lodash-es/isEqual'
import Box from '@mui/material/Box'

const VisibilitySettingCardItem: FC<{
  label: string
  children: React.ReactNode
}> = (props) => {
  const { label, children } = props
  return (
    <Stack direction={'row'} alignItems={'start'}>
      <Stack
        direction={'row'}
        alignItems={'center'}
        sx={{ width: 130, flexShrink: 0, minHeight: 40 }}
      >
        <Typography color={'text.primary'} fontSize={14} fontWeight={500}>
          {label}
        </Typography>
      </Stack>
      <Stack direction={'row'} alignItems={'center'}>
        {children}
      </Stack>
    </Stack>
  )
}

const VisibilitySettingCard: FC<{
  sx?: SxProps
  defaultValue: IVisibilitySetting
  onChange: (value: IVisibilitySetting) => void
  disabled?: boolean
}> = (props) => {
  const { defaultValue, onChange, disabled } = props
  const [visibilitySetting, setVisibilitySetting] =
    useState<IVisibilitySetting>(() => {
      return cloneDeep(defaultValue)
    })
  const prevSetting = React.useRef(visibilitySetting)
  const memoDomains = useMemo(() => {
    return visibilitySetting.isWhitelistMode
      ? visibilitySetting.whitelist
      : visibilitySetting.blacklist
  }, [visibilitySetting])
  const emptyText = useMemo(() => {
    if (memoDomains.length > 0) {
      return ''
    }
    return visibilitySetting.isWhitelistMode
      ? '❌ Disabled on all websites'
      : '✅ Enabled on all websites'
  }, [memoDomains, visibilitySetting.isWhitelistMode])
  useFocus(() => {
    getChromeExtensionButtonSettings('textSelectPopupButton').then(
      (textSelectPopupSetting) => {
        textSelectPopupSetting &&
          setVisibilitySetting(textSelectPopupSetting.visibility)
      },
    )
  })
  useEffect(() => {
    if (prevSetting.current) {
      if (
        prevSetting.current.isWhitelistMode !==
        visibilitySetting.isWhitelistMode
      ) {
        onChange(visibilitySetting)
      } else {
        if (visibilitySetting.isWhitelistMode) {
          if (
            !isEqual(prevSetting.current.whitelist, visibilitySetting.whitelist)
          ) {
            onChange(visibilitySetting)
          }
        } else if (
          !isEqual(prevSetting.current.blacklist, visibilitySetting.blacklist)
        ) {
          onChange(visibilitySetting)
        }
      }
    }
    prevSetting.current = visibilitySetting
  }, [visibilitySetting])
  return (
    <Stack sx={{ ...props.sx }}>
      <Box
        sx={{
          p: 1,
          bgcolor: 'background.paper',
          borderRadius: '4px',
          border: '1px solid',
          borderColor: 'customColor.borderColor',
        }}
      >
        <Stack spacing={2} p={2}>
          <VisibilitySettingCardItem label={'Mode'}>
            <ToggleButtonGroup
              disabled={disabled}
              size={'small'}
              color="primary"
              value={
                visibilitySetting.isWhitelistMode ? 'whiteList' : 'blackList'
              }
              exclusive
              onChange={(event, value) => {
                setVisibilitySetting({
                  ...visibilitySetting,
                  isWhitelistMode: value === 'whiteList',
                })
              }}
              aria-label="Platform"
            >
              <ToggleButton sx={{ width: 220 }} value="blackList">
                Disable on selected websites
              </ToggleButton>
              <ToggleButton sx={{ width: 220 }} value="whiteList">
                Enable on selected websites
              </ToggleButton>
            </ToggleButtonGroup>
          </VisibilitySettingCardItem>
          <VisibilitySettingCardItem label={'Selected websites'}>
            <Stack sx={{ width: '100%' }} spacing={2}>
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                <DomainSelect
                  sx={{
                    width: 220,
                  }}
                  disabled={disabled}
                  onChange={async (value) => {
                    if (!value) {
                      return
                    }
                    if (visibilitySetting.isWhitelistMode) {
                      setVisibilitySetting({
                        ...visibilitySetting,
                        whitelist: uniq([
                          value,
                          ...visibilitySetting.whitelist,
                        ]),
                      })
                    } else {
                      setVisibilitySetting({
                        ...visibilitySetting,
                        blacklist: uniq([
                          value,
                          ...visibilitySetting.blacklist,
                        ]),
                      })
                    }
                  }}
                />
              </Stack>
              <Stack
                direction={'row'}
                flexWrap={'wrap'}
                alignItems={'center'}
                width={'100%'}
                sx={{
                  overflowY: 'auto',
                  maxHeight: 144,
                }}
              >
                <Typography fontSize={14} color={'text.primary'}>
                  {emptyText}
                </Typography>
                {memoDomains.map((domain) => (
                  <DomainDeleteItem
                    key={domain}
                    domain={domain}
                    sx={{
                      width: '200px',
                    }}
                    onDelete={async (domain) => {
                      if (visibilitySetting.isWhitelistMode) {
                        setVisibilitySetting({
                          ...visibilitySetting,
                          whitelist: visibilitySetting.whitelist.filter(
                            (item) => item !== domain,
                          ),
                        })
                      } else {
                        setVisibilitySetting({
                          ...visibilitySetting,
                          blacklist: visibilitySetting.blacklist.filter(
                            (item) => item !== domain,
                          ),
                        })
                      }
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </VisibilitySettingCardItem>
        </Stack>
      </Box>
    </Stack>
  )
}
const DomainDeleteItem: FC<{
  domain: string
  onDelete: (domain: string) => void
  sx?: SxProps
}> = (props) => {
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      spacing={1}
      width={'100%'}
      sx={{
        py: 0.5,
        px: 1,
        m: 0.5,
        borderRadius: '4px',
        bgcolor: (t) =>
          t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f7f8fa',
        ...props.sx,
      }}
    >
      <img
        src={domain2Favicon(props.domain)}
        alt={props.domain}
        style={{
          width: 16,
          height: 16,
          flexShrink: 0,
        }}
      />
      <Typography
        fontSize={14}
        color={'text.primary'}
        width={0}
        flex={1}
        noWrap
      >
        {props.domain}
      </Typography>
      <IconButton
        sx={{
          flexShrink: 0,
        }}
        onClick={() => {
          props.onDelete(props.domain)
        }}
      >
        <ContextMenuIcon icon={'Delete'} />
      </IconButton>
    </Stack>
  )
}
export default VisibilitySettingCard
