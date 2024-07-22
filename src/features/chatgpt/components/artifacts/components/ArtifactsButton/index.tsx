import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import CodeOffOutlinedIcon from '@mui/icons-material/CodeOffOutlined'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import { SvgIcon } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo } from 'react'

import {
  ArtifactsType,
  IArtifacts,
  useArtifacts,
} from '@/features/chatgpt/components/artifacts'

const ArtifactsFileIcon: FC<{
  artifacts: IArtifacts
}> = (props) => {
  const { artifacts } = props
  const RenderIcon = useMemo(() => {
    const artifactsType = artifacts.type
    switch (artifactsType) {
      case ArtifactsType.SVG:
        return (
          <ArticleOutlinedIcon
            sx={{
              fontSize: '20px',
              color: '#fff',
              position: 'absolute',
              bottom: '6px',
              left: '10px',
              zIndex: 2,
            }}
          />
        )
      case ArtifactsType.HTML:
        return (
          <LanguageOutlinedIcon
            sx={{
              fontSize: '20px',
              color: '#fff',
              position: 'absolute',
              bottom: '6px',
              left: '10px',
              zIndex: 2,
            }}
          />
        )
      case ArtifactsType.MERMAID:
      case ArtifactsType.CODE:
        return (
          <CodeOffOutlinedIcon
            sx={{
              fontSize: '20px',
              color: '#fff',
              position: 'absolute',
              bottom: '6px',
              left: '10px',
              zIndex: 2,
            }}
          />
        )
      case ArtifactsType.MARKDOWN:
      case ArtifactsType.TEXT:
        return (
          <ArticleOutlinedIcon
            sx={{
              fontSize: '20px',
              color: '#fff',
              position: 'absolute',
              bottom: '6px',
              left: '10px',
              zIndex: 2,
            }}
          />
        )
      default:
        return (
          <Typography
            sx={{
              position: 'absolute',
              bottom: '6px',
              fontSize: '9px',
              width: '100%',
              left: 0,
              textAlign: 'center',
              color: '#fff',
              fontWeight: 700,
              zIndex: 2,
            }}
          >
            {artifactsType?.toUpperCase()}
          </Typography>
        )
    }
  }, [artifacts.type])
  return (
    <Stack
      sx={{
        width: '40px',
        height: '40px',
        position: 'relative',
      }}
      justifyContent={'center'}
      alignItems={'center'}
    >
      <SvgIcon
        sx={{
          fontSize: '40px',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        <svg
          width='40'
          height='40'
          viewBox='0 0 40 40'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M4 4C4 1.79086 5.79086 0 8 0H24L36 12V36C36 38.2091 34.2091 40 32 40H8C5.79086 40 4 38.2091 4 36V4Z'
            fill='#7F56D9'
          />
          <path
            opacity='0.3'
            d='M24 0L36 12H28C25.7909 12 24 10.2091 24 8V0Z'
            fill='white'
          />
        </svg>
      </SvgIcon>
      {RenderIcon}
    </Stack>
  )
}

const ArtifactsButton: FC<{
  artifacts: IArtifacts
}> = (props) => {
  const { artifacts } = props
  const { updateArtifacts, showArtifacts, isOpen } = useArtifacts()

  const handleClick = () => {
    updateArtifacts(artifacts)
    showArtifacts(artifacts.complete ? 'preview' : 'code')
  }
  const isOpenRef = React.useRef(isOpen)
  // 标记自动打开，自动打开的结束后需要切换到preview
  const isAutoOpenRef = React.useRef(false)

  const memoArtifactsDescription = useMemo(() => {
    if (!artifacts?.type) return ''
    switch (artifacts.type) {
      case ArtifactsType.CODE:
        return 'Click to open code'
      case ArtifactsType.MARKDOWN:
      case ArtifactsType.TEXT:
        return 'Click to open document'
      case ArtifactsType.MERMAID:
        return 'Click to open diagram'
      case ArtifactsType.HTML:
        return 'Click to open website'
      case ArtifactsType.SVG:
        return 'Click to open image'
      default:
        return 'Click to open'
    }
  }, [artifacts.type])
  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])
  useEffect(() => {
    updateArtifacts(artifacts)
    if (!artifacts.complete) {
      isAutoOpenRef.current = true
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
      {/*{JSON.stringify(artifacts)}*/}
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
          <ArtifactsFileIcon artifacts={artifacts} />
          {/*<ContextMenuIcon*/}
          {/*  sx={{*/}
          {/*    fontSize: '20px',*/}
          {/*  }}*/}
          {/*  icon={!artifacts.complete ? 'Loading' : 'InsertDriveFile'}*/}
          {/*/>*/}
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
              {memoArtifactsDescription}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}
export { ArtifactsButton }
