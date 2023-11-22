import React, { FC, useEffect } from 'react'
import PromptLibraryHeader from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader'
import Stack from '@mui/material/Stack'
import PromptLibraryList from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList'
import usePromptLibrary from '@/features/prompt_library/hooks/usePromptLibrary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PromptLibraryListProgress from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList/PromptLibraryListProgress'
const queryClient = new QueryClient()

const PromptLibraryApp: FC = () => {
  const { initPromptLibrary } = usePromptLibrary()
  useEffect(() => {
    initPromptLibrary({})
  }, [])
  return (
    <Stack height={'100%'} position={'relative'} gap={2}>
      <PromptLibraryListProgress
        sx={{
          width: 'calc(100% + 32px)',
          left: -16,
          top: -16,
        }}
      />
      <PromptLibraryHeader />
      <PromptLibraryList />
    </Stack>
  )
}

const PromptLibrary: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PromptLibraryApp />
    </QueryClientProvider>
  )
}

export default PromptLibrary
