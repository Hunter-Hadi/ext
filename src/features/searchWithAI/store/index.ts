import { atom } from 'recoil'

import { ICrawlingSearchResult } from '@/features/shortcuts/utils/searchEngineCrawling'

import {
  DEFAULT_SEARCH_WITH_AI_SETTING,
  ISearchWithAISettings,
} from '../utils/searchWithAISettings'

interface ISourcesStatusAtom {
  loading: boolean
  sources: ICrawlingSearchResult[]
}

export const SearchWithAISourcesState = atom<ISourcesStatusAtom>({
  key: 'SearchWithAISourcesState',
  default: {
    loading: false,
    sources: [],
  },
})

interface ISearchWithAISettingsAtomType extends ISearchWithAISettings {
  loaded: boolean
}

export const SearchWithAISettingsAtom = atom<ISearchWithAISettingsAtomType>({
  key: 'SearchWithAISettingsAtom',
  default: {
    loaded: false,
    ...DEFAULT_SEARCH_WITH_AI_SETTING,
  },
})

// search with ai 是否可以自动 trigger ask  的开关
export const AutoTriggerAskEnableAtom = atom({
  key: 'AutoTriggerAskEnableAtom',
  default: true,
})

export const SearchWithAIProviderLoadingAtom = atom({
  key: 'SearchWithAIProviderLoadingAtom',
  default: false,
})

export interface ISearchWithAIConversationType {
  conversationId: string
  loading: boolean
  writingMessage: string
  completedMessage: string
  errorMessage: string
}

export const SearchWithAIConversationAtom = atom<ISearchWithAIConversationType>(
  {
    key: 'SearchWithAIConversationAtom',
    default: {
      conversationId: '',
      loading: false,
      writingMessage: '',
      completedMessage: '',
      errorMessage: '',
    },
  },
)
