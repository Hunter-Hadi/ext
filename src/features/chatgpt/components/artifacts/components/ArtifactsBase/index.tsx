import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useRef } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { useArtifacts } from '@/features/chatgpt/components/artifacts'
import { ArtifactsCodeBlock } from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/components'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

export interface IArtifactsBaseProps {
  sx?: SxProps
}

const ArtifactsBase: FC<IArtifactsBaseProps> = (props) => {
  const { sx } = props
  const { artifacts, mode, setMode, hideArtifacts } = useArtifacts()
  const renderRef = useRef<HTMLDivElement | null>(null)
  const isImmseriveChatRef = useRef(isMaxAIImmersiveChatPage())
  const handleChange = (newMode: 'preview' | 'code') => {
    if (newMode) {
      setMode(newMode)
    }
  }
  const loadPreviewContent = () => {
    if (!renderRef.current) {
      return
    }
    renderRef.current?.querySelector('iframe')?.remove()
    if (mode === 'preview') {
      renderRef.current?.querySelector('iframe')?.remove()
      const iframe = document.createElement('iframe')
      iframe.style.width = '100%'
      iframe.style.height = '100%'
      iframe.style.border = 'none'
      iframe.src = 'https://www.maxai.space/?code=' + Math.random()
      iframe.onload = () => {
        iframe?.contentWindow?.postMessage(artifacts.content, '*')
      }
      renderRef.current.appendChild(iframe)
    }
  }
  useEffect(() => {
    loadPreviewContent()
  }, [mode])
  useEffect(() => {
    setMode(artifacts.complete ? 'preview' : 'code')
  }, [artifacts.complete, artifacts.identifier])
  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        borderRadius: '16px',
        ...sx,
      }}
    >
      <Stack
        sx={{
          height: '64px',
          flexShrink: 0,
          gap: '8px',
          borderBottom: '1px solid',
          borderColor: 'customColor.borderColor',
          px: '16px',
        }}
        direction={'row'}
        alignItems={'center'}
      >
        <Typography
          fontSize={'16px'}
          fontWeight={500}
          color={'text.primary'}
          noWrap
          textAlign={'center'}
          flex={1}
          width={0}
        >
          {artifacts.title}
        </Typography>
        <Stack
          sx={{
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center',
            '& > span > button': {
              width: '32px',
              height: '32px',
              padding: '6px',
            },
          }}
        >
          {mode === 'preview' && (
            <TooltipIconButton
              title={'Reload'}
              onClick={() => {
                loadPreviewContent()
              }}
            >
              <ContextMenuIcon sx={{ fontSize: '24px' }} icon={'Restart'} />
            </TooltipIconButton>
          )}
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              margin: '0 8px',
            }}
          >
            <Button
              onClick={() => {
                handleChange('preview')
              }}
              variant={mode === 'preview' ? 'contained' : 'outlined'}
              sx={{
                minWidth: 'unset',
                height: '40px',
                boxSizing: 'border-box',
                borderRadius: '8px 0 0 8px',
                padding: '8px 16px',
              }}
            >
              <Typography fontSize={'14px'}>Preview</Typography>
            </Button>
            <Button
              onClick={() => {
                handleChange('code')
              }}
              variant={mode === 'code' ? 'contained' : 'outlined'}
              sx={{
                minWidth: 'unset',
                height: '40px',
                boxSizing: 'border-box',
                borderRadius: '0 8px 8px 0',
                padding: '8px 16px',
              }}
            >
              <Typography fontSize={'14px'}>Code</Typography>
            </Button>
          </Stack>
          {!isImmseriveChatRef.current && (
            <TooltipIconButton title={'Fullscreen'} onClick={() => {}}>
              <ContextMenuIcon sx={{ fontSize: '24px' }} icon={'Fullscreen'} />
            </TooltipIconButton>
          )}
          <TooltipIconButton title={'Download'} onClick={() => {}}>
            <ContextMenuIcon sx={{ fontSize: '24px' }} icon={'FileDownload'} />
          </TooltipIconButton>
          <TooltipIconButton title={'Copy'} onClick={() => {}}>
            <ContextMenuIcon sx={{ fontSize: '20px' }} icon={'Copy'} />
          </TooltipIconButton>
          <TooltipIconButton
            title={'Close'}
            onClick={() => {
              hideArtifacts()
            }}
          >
            <ContextMenuIcon sx={{ fontSize: '24px' }} icon={'Close'} />
          </TooltipIconButton>
        </Stack>
      </Stack>
      <Stack
        component={'div'}
        ref={renderRef}
        sx={{
          flex: 1,
          height: 0,
        }}
      >
        {mode === 'code' && (
          <ArtifactsCodeBlock lang={'html'} code={artifacts.content} />
        )}
      </Stack>
    </Paper>
  )
}

export { ArtifactsBase }
