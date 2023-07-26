import React from 'react'

export const settingsPageRouterList = [
  {
    route: '/people',
    label: 'people',
  },
  {
    route: '/my-own-prompts',
    label: 'my_own_prompts',
  },
  {
    route: '/openai-api-key',
    label: 'openai_api_key',
    divider: true,
  },
  {
    route: '/shortcut',
    label: 'shortcut',
  },
  {
    route: '/appearance',
    label: 'appearance',
  },
  {
    route: '/mini-menu',
    label: 'mini_menu',
  },
  {
    route: '/language',
    label: 'languages',
    divider: true,
  },
  {
    route: '/chatgpt-stable-mode',
    label: 'chatgpt_stable_mode',
  },
  {
    route: '/help',
    label: 'help',
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
