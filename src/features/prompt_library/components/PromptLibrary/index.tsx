import React, { FC } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import PromptLibraryHeader from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader'
import PromptLibraryList from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList'
const queryClient = new QueryClient()

const PromptLibrary: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PromptLibraryHeader />
      <PromptLibraryList />
    </QueryClientProvider>
  )
}
export default PromptLibrary
