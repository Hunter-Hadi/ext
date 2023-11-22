import { atom } from 'recoil'

import { IOptionType } from '@/components/select/BaseSelect'
import { DEFAULT_PROMPT_LIST_TYPE } from '@/features/prompt_library/constant'
import {
  IPromptLibraryListParametersState,
  IPromptLibraryState,
  IPromptListType,
} from '@/features/prompt_library/types'

export const PrompstCategoryOptions = atom<IOptionType[]>({
  key: 'PromptCategoryOptions',
  default: [],
})

export const DEFAULT_PROMPT_SEARCH_PARAMS = {
  category: 'All',
  use_case: 'All',
  keyword: '',
  tab_active: DEFAULT_PROMPT_LIST_TYPE,
  // current: 0,
  // pageSize: 12,
}

export interface IPromptSearchParamsStore {
  category: string
  use_case: string
  keyword: string
  tab_active: IPromptListType
  // current: number;
  // pageSize: number;
}

export const PromptSearchParamsStore = atom<IPromptSearchParamsStore>({
  key: 'PromptSearchParamsStore',
  default: DEFAULT_PROMPT_SEARCH_PARAMS,
})

export const FavoritesPromptIdsAtom = atom<string[]>({
  key: 'FavoritesPromptIdsAtom',
  default: [],
})

export const SelectPromptIdAtom = atom<string | null>({
  key: 'SelectPromptIdAtom',
  default: null,
})

export const PromptLibraryState = atom<IPromptLibraryState>({
  key: 'PromptLibraryState',
  default: {
    open: false,
    selectedPromptId: '',
    onClickPrompt: async () => {},
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
