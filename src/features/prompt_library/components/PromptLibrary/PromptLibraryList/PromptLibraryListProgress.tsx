import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useEffect, useState } from 'react'

import usePromptLibraryList from '@/features/prompt_library/hooks/usePromptLibraryList'

const useProgress = (isActive: boolean): number => {
  const [progress, setProgress] = useState<number>(0)
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    if (isActive) {
      setProgress(10)
      intervalId = setInterval(() => {
        setProgress((prevProgress: number) => {
          const newProgress = prevProgress + 10
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 50)
    } else {
      setProgress(0)
    }
    return () => {
      intervalId && clearInterval(intervalId)
    }
  }, [isActive])

  return progress
}

const PromptLibraryListProgress: FC<{
  sx: SxProps
}> = (props) => {
  const { sx } = props
  const { isFetching, isLoading } = usePromptLibraryList()
  const progress = useProgress(isFetching)
  return (
    <Stack
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        ...sx,
      }}
    >
      {!isLoading && isFetching && (
        <LinearProgress
          sx={{
            [`&.${linearProgressClasses.root}`]: {
              backgroundColor: 'transparent',
            },
          }}
          variant="determinate"
          value={progress}
        />
      )}
    </Stack>
  )
}
export default PromptLibraryListProgress
