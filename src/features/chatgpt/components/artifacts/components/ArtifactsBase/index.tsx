import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import TooltipIconButton from '@/components/TooltipIconButton'
import { useArtifacts } from '@/features/chatgpt/components/artifacts'
import ArtifactsCodeBlock from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/ArtifactsCodeBlock'
import ArtifactsPreview from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/ArtifactsPreview'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { chromeExtensionClientOpenPage } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

export interface IArtifactsBaseProps {
  sx?: SxProps
}

const ArtifactsBase: FC<IArtifactsBaseProps> = (props) => {
  const { sx } = props
  const { t } = useTranslation(['client'])
  const {
    artifacts,
    mode,
    setMode,
    hideArtifacts,
    reloadArtifactsPreview,
    downloadArtifacts,
  } = useArtifacts()
  const { currentConversationId } = useClientConversation()
  const renderRef = useRef<HTMLDivElement | null>(null)
  const isImmersiveChatRef = useRef(isMaxAIImmersiveChatPage())
  const handleChange = (newMode: 'preview' | 'code') => {
    if (newMode) {
      setMode(newMode)
    }
  }
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
        overflow: 'hidden',
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
          <TooltipIconButton
            title={t(
              'client:chat__artifacts__preview__tools__refresh_button__title',
            )}
            onClick={reloadArtifactsPreview}
          >
            <ContextMenuIcon sx={{ fontSize: '24px' }} icon={'Restart'} />
          </TooltipIconButton>
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
              <Typography fontSize={'14px'}>
                {t(
                  'client:chat__artifacts__preview__tools__preview_button__title',
                )}
              </Typography>
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
              <Typography fontSize={'14px'}>
                {t(
                  'client:chat__artifacts__preview__tools__code_button__title',
                )}
              </Typography>
            </Button>
          </Stack>
          {!isImmersiveChatRef.current && mode === 'preview' && (
            <TooltipIconButton
              title={t(
                'client:chat__artifacts__preview__tools__fullscreen_button__title',
              )}
              onClick={() => {
                chromeExtensionClientOpenPage({
                  url: Browser.runtime.getURL(`/pages/chat/index.html`),
                  query: `?artifacts=${artifacts.identifier}#/chat/${currentConversationId}`,
                })
              }}
            >
              <ContextMenuIcon sx={{ fontSize: '24px' }} icon={'Fullscreen'} />
            </TooltipIconButton>
          )}
          <TooltipIconButton
            title={t(
              'client:chat__artifacts__preview__tools__download_button__title',
            )}
            onClick={downloadArtifacts}
          >
            <ContextMenuIcon sx={{ fontSize: '24px' }} icon={'FileDownload'} />
          </TooltipIconButton>
          <CopyTooltipIconButton
            copyText={artifacts.content}
            title={t(
              'client:chat__artifacts__preview__tools__copy_button__title',
            )}
          />
          <TooltipIconButton
            title={t(
              'client:chat__artifacts__preview__tools__close_button__title',
            )}
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
          // borderRadius: '0 0 16px',
          // overflow: 'hidden',
        }}
      >
        {mode === 'preview' && (
          <ArtifactsPreview sx={{ flex: 1 }} artifacts={artifacts} />
        )}
        {mode === 'code' && <ArtifactsCodeBlock artifacts={artifacts} />}
      </Stack>
    </Paper>
  )
}

export { ArtifactsBase }
