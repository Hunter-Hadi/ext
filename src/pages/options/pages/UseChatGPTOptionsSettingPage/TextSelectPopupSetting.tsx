import React, { FC, useEffect, useState } from 'react'
import { Box, Button, Paper, Stack, Switch, Typography } from '@mui/material'
import { UseChatGptIcon } from '@/components/CustomIcon'

const TextSelectPopupSetting: FC<{
  commandKey?: string
  visible: boolean
  onChange: (visible: boolean) => void
}> = (props) => {
  const { visible, onChange, commandKey } = props
  const [showTooltip, setShowTooltip] = useState(false)
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
          border: '1px solid #e0e0e0',
          position: 'relative',
        }}
      >
        <Typography fontSize={14} component={'div'}>
          <p>Wikipedia is hosted by the Wikimedia Foundation, a non-profit</p>
          <span
            style={{
              backgroundColor: 'rgb(180,215,250)',
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
              border: '1px solid rgb(237,237,236)',
              width: 'max-content',
            }}
          >
            <Button
              size={'small'}
              variant={'text'}
              startIcon={
                <UseChatGptIcon
                  sx={{
                    fontSize: 16,
                    color: 'inherit',
                  }}
                />
              }
              sx={{
                width: 130,
                height: 32,
                color: 'inherit',
              }}
            >
              Use ChatGPT
            </Button>
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
    </Stack>
  )
}
export default TextSelectPopupSetting
