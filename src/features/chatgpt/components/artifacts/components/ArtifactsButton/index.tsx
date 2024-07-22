import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import CodeOffOutlinedIcon from '@mui/icons-material/CodeOffOutlined'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import { SvgIcon } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

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
    if (!artifacts.complete) {
      return (
        <CircularProgress
          size={16}
          sx={{
            fontSize: '20px',
            color: '#fff',
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            zIndex: 2,
          }}
        />
      )
    }
    switch (artifactsType) {
      case ArtifactsType.SVG:
        return (
          <SvgIcon
            sx={{
              fontSize: '20px',
              color: '#fff',
              position: 'absolute',
              bottom: '6px',
              left: '10px',
              zIndex: 2,
            }}
          >
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M9.93421 7.967C9.93421 5.31313 12.0856 3.16174 14.7395 3.16174C17.3933 3.16174 19.5447 5.31313 19.5447 7.967C19.5447 10.6209 17.3933 12.7723 14.7395 12.7723C12.0856 12.7723 9.93421 10.6209 9.93421 7.967ZM14.7395 5.07314C13.1412 5.07314 11.8456 6.36876 11.8456 7.967C11.8456 9.56524 13.1412 10.8609 14.7395 10.8609C16.3377 10.8609 17.6333 9.56524 17.6333 7.967C17.6333 6.36876 16.3377 5.07314 14.7395 5.07314Z'
                fill='currentColor'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M5.35907 7.18053C5.67707 6.21894 7.03728 6.21893 7.35528 7.18053L10.6604 17.1748C10.8854 17.855 10.3788 18.5561 9.66228 18.5561H3.05206C2.33555 18.5561 1.82899 17.855 2.05396 17.1748L5.35907 7.18053ZM6.35717 10.2501L4.24245 16.6447H8.4719L6.35717 10.2501Z'
                fill='currentColor'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M12.9094 13.8565C12.3288 13.8565 11.8581 14.3272 11.8581 14.9078V19.787C11.8581 20.3676 12.3288 20.8383 12.9094 20.8383H20.9487C21.5293 20.8383 22 20.3676 22 19.787V14.9078C22 14.3272 21.5293 13.8565 20.9487 13.8565H12.9094ZM13.7695 18.9269V15.7679H20.0886V18.9269H13.7695Z'
                fill='currentColor'
              />
            </svg>
          </SvgIcon>
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
  }, [artifacts.type, artifacts.complete])
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
  const { t } = useTranslation(['client'])
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
        return t('client:chat__artifacts__button__description__code')
      case ArtifactsType.MARKDOWN:
      case ArtifactsType.TEXT:
        return t('client:chat__artifacts__button__description__document')
      case ArtifactsType.MERMAID:
        return t('client:chat__artifacts__button__description__diagram')
      case ArtifactsType.HTML:
        return t('client:chat__artifacts__button__description__html')
      case ArtifactsType.SVG:
        return t('client:chat__artifacts__button__description__image')
      default:
        return t('client:chat__artifacts__button__description__empty')
    }
  }, [artifacts.type, t])
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
  }, [artifacts.complete])
  return (
    <Stack
      component={'div'}
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
