import { createContext } from 'react'
import { atom } from 'recoil'

import {
  IPromptLibraryListParametersState,
  IPromptLibraryState,
} from '@/features/prompt_library/types'

export const PromptLibraryState = atom<IPromptLibraryState>({
  key: 'PromptLibraryState',
  default: {
    open: false,
    editPromptId: '',
    selectedPromptLibraryCard: null,
  },
})

export const PromptLibraryListParametersState = atom<IPromptLibraryListParametersState>(
  {
    key: 'PromptLibraryListParametersState',
    default: {
      enabled: false,
      activeTab: 'Public',
      query: '',
      category: 'All',
      use_case: 'All',
      page: 0,
      page_size: 12,
      total: 0,
    },
  },
)
export type PromptLibraryRuntimeType = 'Page' | 'Sidebar'
export type PromptLibraryRuntimeContextType = {
  runtime: PromptLibraryRuntimeType
}
export const PromptLibraryRuntimeContext = createContext<
  PromptLibraryRuntimeContextType | undefined
>(undefined)
