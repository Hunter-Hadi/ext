import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { useArtifacts } from '@/features/chatgpt/components/artifacts'
import { IArtifacts } from '@/features/chatgpt/components/artifacts/store/ArtifactsState'

const FileBaseSvg: FC = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='32'
      height='40'
      viewBox='0 0 32 40'
      fill='none'
    >
      <mask
        id='mask0_2482_7149'
        maskUnits='userSpaceOnUse'
        x='0'
        y='0'
        width='32'
        height='40'
      >
        <path
          d='M0 4C0 1.79086 1.79086 0 4 0H20L32 12V36C32 38.2091 30.2091 40 28 40H4C1.79086 40 0 38.2091 0 36V4Z'
          fill='url(#paint0_linear_2482_7149)'
        />
      </mask>
      <g mask='url(#mask0_2482_7149)'>
        <path
          d='M0 4C0 1.79086 1.79086 0 4 0H20L32 12V36C32 38.2091 30.2091 40 28 40H4C1.79086 40 0 38.2091 0 36V4Z'
          fill='#F2F4F7'
        />
      </g>
      <defs>
        <linearGradient
          id='paint0_linear_2482_7149'
          x1='16'
          y1='0'
          x2='16'
          y2='40'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopOpacity='0.4' />
          <stop offset='1' />
        </linearGradient>
      </defs>
    </svg>
  )
}

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
