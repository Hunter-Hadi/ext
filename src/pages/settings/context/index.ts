import React from 'react'

export const settingsPageRouterList: Array<{
  route: string
  label: string
  divider?: boolean
}> = [
  {
    route: '/people',
    label: 'left_menu__me',
  },
  {
    route: '/my-own-prompts',
    label: 'left_menu__my_own_prompts',
  },
  {
    route: '/openai-api-key',
    label: 'left_menu__openai_api_key',
    divider: true,
  },
  {
    route: '/shortcut',
    label: 'left_menu__shortcut',
  },
  {
    route: '/appearance',
    label: 'left_menu__appearance',
  },
  {
    route: '/mini-menu',
    label: 'left_menu__mini_menu',
  },
  {
    route: '/language',
    label: 'left_menu__languages',
    divider: true,
  },
  {
    route: '/chatgpt-stable-mode',
    label: 'left_menu__chatgpt_stable_mode',
  },
  {
    route: '/help',
    label: 'left_menu__help',
  },
]

export const SettingsPageRouteContext = React.createContext({
  route: '/',
  setRoute: (route: string) => {
    console.log('setRoute', route)
  },
})

export const getLocationHashRoute = () => {
  const hash = window.location.hash
  let route = hash.replace('#', '')
  if (!route) {
    route = '/people'
    setLocationHashRoute(route)
  }
  return route
}

export const setLocationHashRoute = (route: string) => {
  window.location.hash = `#${route}`
}
