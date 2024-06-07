import React from 'react'

import { CHROME_EXTENSION_HELP_TO } from '@/constants'

export const settingsPageRouterList = [
  {
    route: '/me' as const,
    label: 'left_menu__me',
    divider: false,
  },
  {
    route: '/my-own-prompts' as const,
    label: 'left_menu__my_own_prompts',
    divider: false,
  },
  {
    route: '/openai-api-key' as const,
    label: 'left_menu__openai_api_key',
    divider: true,
  },
  {
    route: '/sidebar' as const,
    label: 'left_menu__sidebar',
    divider: false,
  },
  {
    route: '/shortcut' as const,
    label: 'left_menu__shortcut',
    divider: false,
  },
  {
    route: '/appearance' as const,
    label: 'left_menu__appearance',
    divider: false,
  },
  {
    route: '/mini-menu' as const,
    label: 'left_menu__mini_menu',
    divider: false,
  },
  {
    route: '/search-with-ai' as const,
    label: 'left_menu__search_with_ai',
    divider: false,
  },
  {
    route: '/help-me-write' as const,
    label: 'left_menu__instant_reply',
    divider: false,
  },
  {
    route: '/language' as const,
    label: 'left_menu__languages',
    divider: true,
  },
  {
    route: '/chatgpt-stable-mode' as const,
    label: 'left_menu__chatgpt_stable_mode',
    divider: false,
  },
  {
    route: '/perks' as const,
    label: 'left_menu__perks',
    divider: true,
  },
  {
    route: '/help' as const,
    label: 'left_menu__help',
    link: CHROME_EXTENSION_HELP_TO,
    divider: false,
  },
]

export type ISettingsRouteType =
  | (typeof settingsPageRouterList)[number]['route']
  | '/login'

export const SettingsPageRouteContext = React.createContext<{
  route: ISettingsRouteType
  setRoute: (route: ISettingsRouteType) => void
}>({
  route: '/me',
  setRoute: (route: string) => {
    console.log('setRoute', route)
  },
})

export const getLocationHashRoute = () => {
  const [name, query = ''] = window.location.hash.split('?')
  let route = name.replace('#', '')
  if (!route) {
    route = '/me'
    setLocationHashRoute(route as ISettingsRouteType)
  }
  return [route as ISettingsRouteType, query] as const
}

export const setLocationHashRoute = (
  route: ISettingsRouteType | `${ISettingsRouteType}?${string}`,
) => {
  window.location.hash = `#${route}`
}
