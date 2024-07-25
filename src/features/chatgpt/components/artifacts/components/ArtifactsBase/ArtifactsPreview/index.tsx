import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { IArtifactsPreviewProps } from '@/features/chatgpt/components/artifacts'
import { useReloadArtifactsPreview } from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/ArtifactsPreview/useReloadArtifactsPreview'
import { startSandBoxRender } from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/ArtifactsPreview/utils'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'

const ArtifactsPreview: FC<IArtifactsPreviewProps> = (props) => {
  const { artifacts, sx } = props
  const boxRef = useRef<HTMLDivElement | null>(null)
  const [loadingIframe, setLoadingIframe] = useState(false)
  const memoLoading = useMemo(() => {
    return loadingIframe || !artifacts.complete
  }, [loadingIframe, artifacts.complete])
  const rerenderHTML = useCallback(async () => {
    if (!boxRef.current) {
      return
    }
    try {
      setLoadingIframe(true)
      const isSuccess = await startSandBoxRender(boxRef.current, artifacts)
      console.log('rerenderHTML', isSuccess)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingIframe(false)
    }
  }, [artifacts.content])
  useEffect(() => {
    if (artifacts.complete) {
      rerenderHTML().then().catch()
    }
  }, [rerenderHTML, artifacts.content])
  useReloadArtifactsPreview(rerenderHTML)
  return (
    <Stack ref={boxRef} sx={{ position: 'relative', ...sx }} component={'div'}>
      <Box
        component={'div'}
        sx={{
          ...(memoLoading
            ? {
                '& + iframe': {
                  opacity: 0,
                },
              }
            : {}),
        }}
      >
        <AppLoadingLayout
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 1,
          }}
          loading={memoLoading}
          size={16}
        />
      </Box>
    </Stack>
  )
}

export default ArtifactsPreview
