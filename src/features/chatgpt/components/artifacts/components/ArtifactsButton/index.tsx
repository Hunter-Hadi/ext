import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import {
  IArtifacts,
  useArtifacts,
} from '@/features/chatgpt/components/artifacts'

const ArtifactsButton: FC<{
  loading?: boolean
  artifacts: IArtifacts
}> = (props) => {
  const { artifacts, loading } = props
  const { updateArtifacts, showArtifacts, isOpen } = useArtifacts()

  const handleClick = () => {
    updateArtifacts(artifacts)
    showArtifacts(artifacts.complete ? 'preview' : 'code')
  }
  const isOpenRef = React.useRef(isOpen)
  // 标记自动打开，自动打开的结束后需要切换到preview
  const isAutoOpenRef = React.useRef(false)
  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])
  useEffect(() => {
    if (!artifacts.complete) {
      isAutoOpenRef.current = true
      updateArtifacts(artifacts)
      isOpenRef.current ? showArtifacts() : showArtifacts('code')
    } else {
      if (isOpenRef.current && isAutoOpenRef.current) {
        showArtifacts('preview')
        isAutoOpenRef.current = false
      }
    }
  }, [artifacts.complete, artifacts.content])
  return (
    <Stack
      sx={{
        width: '280px',
        padding: '10px',
        border: '1px solid',
        borderWidth: '1px!important',
        borderColor: (t) =>
          t.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)!important'
            : 'rgba(0,0,0,0.08)!important',
        cursor: 'pointer',
        borderRadius: '8px',
      }}
      onClick={handleClick}
    >
      <Stack alignItems={'center'} direction={'row'} gap={'12px'}>
        <Stack
          sx={{
            flexShrink: 0,
            width: '32px',
            height: '40px',
            position: 'relative',
          }}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <ContextMenuIcon
            sx={{
              fontSize: '20px',
            }}
            icon={loading ? 'Loading' : 'InsertDriveFile'}
          />
        </Stack>
        <Stack width={0} flex={1}>
          <Typography
            noWrap
            fontSize={'14px'}
            fontWeight={500}
            lineHeight={1.5}
            color={'text.primary'}
          >
            {artifacts.title}
          </Typography>
          {artifacts.type && (
            <Typography
              noWrap
              fontSize={'12px'}
              fontWeight={400}
              lineHeight={1.5}
              color={'text.secondary'}
            >
              {artifacts.type}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}
export { ArtifactsButton }
