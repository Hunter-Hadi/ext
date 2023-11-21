import React, { FC } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PromptLibraryHeader from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader'
import Stack from '@mui/material/Stack'
const queryClient = new QueryClient()

const PromptLibrary: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack spacing={2}>
        <PromptLibraryHeader />
      </Stack>
    </QueryClientProvider>
  )
}
export default PromptLibrary
