import React, { FC } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import PromptLibraryHeader from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader'
import PromptLibraryList from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList'
import Stack from '@mui/material/Stack'
const queryClient = new QueryClient()

const PromptLibrary: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack spacing={2}>
        <PromptLibraryHeader />
        <PromptLibraryList />
      </Stack>
    </QueryClientProvider>
  )
}
export default PromptLibrary
