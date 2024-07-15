import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useRef } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { useArtifacts } from '@/features/chatgpt/components/artifacts'
import { ArtifactsCodeBlock } from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/components'

export interface IArtifactsBaseProps {
  sx?: SxProps
}

const ArtifactsBase: FC<IArtifactsBaseProps> = (props) => {
  const { sx } = props
  const { artifacts, mode, setMode, hideArtifacts } = useArtifacts()
  const renderRef = useRef<HTMLDivElement | null>(null)
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'preview' | 'code',
  ) => {
    if (newMode) {
      setMode(newMode)
    }
  }
  useEffect(() => {
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
            gap: '8px',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Button>
            <Typography fontSize={'14px'}>Preview</Typography>
          </Button>
          <ToggleButtonGroup
            size={'small'}
            color='primary'
            value={mode}
            exclusive
            onChange={handleChange}
            aria-label='Platform'
          >
            <ToggleButton value='preview'>Preview</ToggleButton>
            <ToggleButton value='code'>Code</ToggleButton>
          </ToggleButtonGroup>
          <TooltipIconButton title={'Fullscreen'} onClick={() => {}}>
            <ContextMenuIcon sx={{ fontSize: '20px' }} icon={'Fullscreen'} />
          </TooltipIconButton>
          <TooltipIconButton title={'Download'} onClick={() => {}}>
            <ContextMenuIcon sx={{ fontSize: '20px' }} icon={'FileDownload'} />
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
            <ContextMenuIcon sx={{ fontSize: '20px' }} icon={'Close'} />
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
