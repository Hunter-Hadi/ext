import { ICrawlingSearchResult } from '@/features/shortcuts/utils/searchEngineCrawling'
import { atom } from 'recoil'
import {
  DEFAULT_SEARCH_WITH_AI_SETTING,
  ISearchWithAISettings,
} from '../utils/searchWithAISettings'

interface ISourcesStatusAtom {
  loading: boolean
  sources: ICrawlingSearchResult[]
}

export const SourcesStatusAtom = atom<ISourcesStatusAtom>({
  key: 'SourcesStatusAtom',
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
