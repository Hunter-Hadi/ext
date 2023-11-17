import React, { FC } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import PromptLibraryHeader from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader'
const queryClient = new QueryClient()

const PromptLibrary: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PromptLibraryHeader />
    </QueryClientProvider>
  )
}
export default PromptLibrary
