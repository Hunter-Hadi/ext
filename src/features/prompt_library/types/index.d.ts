export type IPromptType = 'private' | 'public'

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
  type?: IPromptType
  update_time?: string
  // api response types
  variables?: IPromptVariable[]
  variable_types?: IPromptVariableType[]
}
export interface IPromptDetailData {
  id: string
  use_case: string
  category: string
  optional_prompt_template: string
  prompt_hint: string
  prompt_title: string
  prompt_template: string
  teaser: string
  user_input: string

  variables?: IPromptVariable[]
  variable_types?: IPromptVariableType[]
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

export interface IPromptVariable {
  name: string
  hint?: string
  color?: string
  isSystemVariable?: boolean
  type: IPromptVariableType
}

export type IPromptVariableType =
  | 'livecrawling'
  | 'websearch'
  | 'system'
  | 'text'

export type IPromptActionKey = 'see' | 'delete' | 'edit' | 'favorite'

export type IPromptListType = 'Favorites' | 'Public' | 'Own'

export interface IPromptLibraryState {
  open: boolean
  selectedPromptId: string
  onClickPrompt: () => Promise<void>
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
