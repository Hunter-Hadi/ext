import React, { FC, useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import useTheme from '@mui/material/styles/useTheme'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import VisibilitySettingCard from '@/components/VisibilitySettingCard'
import CloseAlert from '@/components/CloseAlert'
import { useChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'

const TextSelectPopupSetting: FC<{
  commandKey?: string
  visible: boolean
  onChange: (visible: boolean) => void
}> = (props) => {
  const { buttonSettings, updateButtonSettings } =
    useChromeExtensionButtonSettings()
  const { visible, onChange, commandKey } = props
  const [showTooltip, setShowTooltip] = useState(false)
  const { palette } = useTheme()
  useEffect(() => {
    if (!visible) {
      setShowTooltip(true)
      const timer = setTimeout(() => {
        setShowTooltip(false)
      }, 2000)
      return () => {
        clearTimeout(timer)
      }
    }
    return () => {
      // do nothing
    }
  }, [visible])
  return (
    <Stack>
      <Typography
        fontSize={20}
        fontWeight={700}
        color={'text.primary'}
        component={'h2'}
        id={'text-select-popup'}
      >
        Text-select-popup
      </Typography>
      <CloseAlert
        icon={<></>}
        sx={{
          // bgcolor: '#E2E8F0',
          mt: 1,
          mb: 2,
        }}
      >
        <Typography fontSize={14} color={'text.primary'}>
          Change visibility
        </Typography>
      </CloseAlert>
      <Stack direction={'row'} alignItems={'center'} mb={2}>
        <Typography fontSize={14}>Hidden</Typography>
        <Switch
          checked={visible}
          onChange={(event) => {
            onChange(event.target.checked)
          }}
        />
        <Typography fontSize={14}>Visible</Typography>
      </Stack>
      <Box
        sx={{
          p: 2,
          borderRadius: '4px',
          height: '110px',
          border: '1px solid',
          borderColor: 'customColor.borderColor',
          position: 'relative',
        }}
      >
        <Typography fontSize={14} component={'div'}>
          <p>Wikipedia is hosted by the Wikimedia Foundation, a non-profit</p>
          <span
            style={{
              backgroundColor:
                palette.mode === 'dark' ? '#5880b1' : 'rgb(180,215,250)',
              height: '21px',
              display: 'inline-block',
            }}
          >
            organization that also hosts a range of other projects.
          </span>
        </Typography>
        {visible && (
          <Paper
            elevation={3}
            component={'div'}
            sx={{
              mt: 1,
              borderRadius: '4px',
              border: '1px solid',
              borderColor: 'customColor.borderColor',
              width: 'max-content',
            }}
          >
            <Stack
              direction={'row'}
              alignItems={'center'}
              sx={{
                '& > button': {
                  '&:not(:last-child)': {
                    marginRight: '1px',
                    borderRadius: '4px 0 0 4px',
                    boxShadow: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgb(255 255 255 / 21%) 1px 0px 0px'
                        : 'rgba(55, 53, 47, 0.09) 1px 0px 0px',
                    '&:hover': {
                      boxShadow: (t) =>
                        t.palette.mode === 'dark'
                          ? 'rgb(255 255 255 / 21%) 1px 0px 0px'
                          : 'rgba(55, 53, 47, 0.09) 1px 0px 0px',
                    },
                  },
                },
              }}
            >
              <Button
                size={'small'}
                variant={'text'}
                startIcon={
                  <UseChatGptIcon
                    sx={{
                      fontSize: 16,
                      // color: 'inherit',
                    }}
                  />
                }
                sx={{
                  px: '8px!important',
                  height: 32,
                  color: 'inherit',
                }}
              >
                {commandKey || 'Ask AI'}
              </Button>
              <Button
                sx={{
                  minWidth: 'unset',
                }}
              >
                <ContextMenuIcon
                  sx={{ color: 'text.primary' }}
                  icon={'Settings'}
                />
              </Button>
            </Stack>
          </Paper>
        )}
        {!visible && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 1,
              backgroundColor: 'rgba(98,98,105,1)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              overflow: 'hidden',
              maxWidth: showTooltip ? '100%' : 0,
              display: 'grid',
            }}
            component={'div'}
          >
            <Typography
              fontSize={'24px'}
              fontWeight={'bold'}
              color={'#fff'}
              noWrap
              sx={{ px: '10px', py: '4px' }}
            >
              {commandKey || 'Shortcuts'}
            </Typography>
          </Box>
        )}
      </Box>
      <CloseAlert
        icon={<></>}
        sx={{
          // bgcolor: '#E2E8F0',
          mt: 2,
        }}
      >
        <Typography fontSize={14} color={'text.primary'}>
          Change visibility on specified websites
        </Typography>
      </CloseAlert>
      {buttonSettings?.textSelectPopupButton && visible && (
        <VisibilitySettingCard
          sx={{ mt: 2 }}
          defaultValue={buttonSettings.textSelectPopupButton.visibility}
          onChange={async (newVisibilitySetting) => {
            await updateButtonSettings('textSelectPopupButton', {
              ...buttonSettings?.textSelectPopupButton,
              visibility: newVisibilitySetting,
            })
          }}
        />
      )}
    </Stack>
  )
}
export default TextSelectPopupSetting
