import React from 'react'

export const settingsPageRouterList = [
  {
    route: '/me',
    label: 'left_menu__me',
    divider: false,
  },
  {
    route: '/my-own-prompts',
    label: 'left_menu__my_own_prompts',
    divider: false,
  },
  {
    route: '/openai-api-key',
    label: 'left_menu__openai_api_key',
    divider: true,
  },
  {
    route: '/shortcut',
    label: 'left_menu__shortcut',
    divider: false,
  },
  {
    route: '/appearance',
    label: 'left_menu__appearance',
    divider: false,
  },
  {
    route: '/mini-menu',
    label: 'left_menu__mini_menu',
    divider: false,
  },
  {
    route: '/search-with-ai',
    label: 'left_menu__search_with_ai',
    divider: false,
  },
  {
    route: '/help-me-write',
    label: 'left_menu__writing_assistant',
    divider: false,
  },
  {
    route: '/language',
    label: 'left_menu__languages',
    divider: true,
  },
  {
    route: '/chatgpt-stable-mode',
    label: 'left_menu__chatgpt_stable_mode',
    divider: false,
  },
  {
    route: '/perks',
    label: 'left_menu__perks',
    divider: true,
  },
  {
    route: '/help',
    label: 'left_menu__help',
    divider: false,
  },
] as const

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
  const hash = window.location.hash
  let route = hash.replace('#', '')
  if (!route) {
    route = '/me'
    setLocationHashRoute(route as ISettingsRouteType)
  }
  return route as ISettingsRouteType
}

export const setLocationHashRoute = (route: ISettingsRouteType) => {
  window.location.hash = `#${route}`
}
