export type IPromptLibraryCardType = 'private' | 'public'

export interface IAddPromptLibraryCardParams {
  type: IPromptLibraryCardType
  prompt_hint: string
  prompt_template: string
  prompt_title: string
  teaser: string
  category: string
  use_case: string
  user_input?: string
  optional_prompt_template?: string
  author?: string
  author_url?: string
}

/**
 * 这是列表接口的数据，很多字段会被删除
 */
export interface IPromptLibraryCardData {
  id: string
  use_case: string
  category: string
  prompt_hint: string
  prompt_title: string
  teaser: string
  author_url?: string
  author?: string
  prompt_template?: string
  type?: IPromptLibraryCardType
  update_time?: string
  // api response types
  variables?: IPromptLibraryCardDetailVariable[]
  variable_types?: IPromptLibraryCardDetailVariableType[]
  favourite_cnt?: number
  views?: number
  optional_prompt_template?: string
  user_input?: string
}

export interface IPromptLibraryCardDetailData {
  id: string
  use_case: string
  category: string
  prompt_hint: string
  prompt_title: string
  teaser: string
  author_url?: string
  author?: string
  prompt_template?: string
  type?: IPromptLibraryCardType
  update_time?: string
  // api response types
  variables?: IPromptLibraryCardDetailVariable[]
  variable_types?: IPromptLibraryCardDetailVariableType[]
  favourite_cnt?: number
  views?: number
  optional_prompt_template?: string
  user_input?: string
}

export interface IPromptCategoryApiData {
  category: string
  use_cases: string[]
}

export interface IFavoritePromptListResponse {
  favourite_prompts: IPromptLibraryCardData[]
}
export interface IOwnPromptListResponse {
  own_prompts: IPromptLibraryCardData[]
}

export interface IPromptLibraryCardDetailVariable {
  name: string
  hint?: string
  color?: string
  isSystemVariable?: boolean
  type: IPromptLibraryCardDetailVariableType
}

export type IPromptLibraryCardDetailVariableType =
  | 'livecrawling'
  | 'websearch'
  | 'system'
  | 'text'

export type IPromptActionKey = 'see' | 'delete' | 'edit' | 'favorite'

export type IPromptListType = 'Favorites' | 'Public' | 'Own'

export interface IPromptLibraryState {
  open: boolean
  editPromptId: string
  selectedPromptLibraryCard: IPromptLibraryCardData | null
}

export interface IPromptLibraryListParametersState {
  enabled: boolean
  activeTab: IPromptListType
  query: string
  category: string
  use_case: string
  page: number
  page_size: number
  total: number
}
