import { IPromptListType } from '@/features/prompt_library/types'

export const NEED_AUTH_PROMPT_LIST_TYPE = ['Favorites', 'Own']
export const DEFAULT_PROMPT_LIST_TYPE: IPromptListType = 'Public'
export const DEFAULT_PROMPT_AUTHOR = 'MaxAI.me'
export const DEFAULT_PROMPT_AUTHOR_LINK =
  'https://api.maxai.me/app/maxai-web?ref=webchatgpt'
export const PROMPT_LIBRARY_HOST = 'https://app.maxai.me'

export const DEFAULT_PROMPT_VARIABLE: any[] = [
  // type livecrawling
  {
    name: 'Live Crawling Target URL',
    hint: 'Enter the URL you wish to extract text from',
    type: 'livecrawling',
    isSystemVariable: true,
  },
  {
    name: 'Live Crawling Crawled Text',
    hint:
      'This variable will be automatically updated with text extracted from the target URL',
    type: 'livecrawling',
    isSystemVariable: true,
  },
  // {
  //   name: 'Live Crawling Crawled Html',
  //   hint: 'This variable will be automatically updated with Html extracted from the target URL',
  //   type: 'livecrawling',
  //   isSystemVariable: true,
  // },
  // type webaccess
  {
    name: 'Web Search Query',
    hint: 'Enter your search term',
    type: 'websearch',
    isSystemVariable: true,
  },
  {
    name: 'Web Search Results',
    hint: 'This variable will be automatically updated with the search results',
    type: 'websearch',
    isSystemVariable: true,
  },

  // type system
  {
    name: 'System Current Date',
    hint: 'This variable will be automatically updated with the current date',
    type: 'system',
    isSystemVariable: true,
  },
]
