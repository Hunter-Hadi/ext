export type IPromptType = 'private' | 'public'

export interface IPromptCardData {
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
  use_case: string[]
}

export interface IFavoritesPromptListRespeonse {
  favourite_prompts: IPromptCardData[]
  own_prompts: IPromptCardData[]
  page_number: number
  page_size: number
  total_prompts_cnt: number
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
