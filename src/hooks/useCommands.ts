import isArray from 'lodash-es/isArray'
import { useEffect, useState } from 'react'

import { getChromeExtensionCommands } from '@/background/utils'

const useCommands = () => {
  const [loaded, setLoaded] = useState<boolean>(false)
  const [chatBoxShortCutKey, setChatBoxShortCutKey] = useState<
    undefined | string
  >(undefined)
  const [floatingMenuShortCutKey, setFloatingMenuShortCutKey] = useState<
    undefined | string
  >(undefined)
  const [commands, setCommands] = useState<
    Array<{
      name: string
      shortcut: string
    }>
  >([])
  useEffect(() => {
    let destroyed = false
    const updateCommandKey = async () => {
      if (destroyed) {
        return
      }
      const commands = await getChromeExtensionCommands()
      let shortCutKey: string | undefined = undefined
      let floatingMenuShortCutKey: string | undefined = undefined
      if (isArray(commands) && commands.length > 0) {
        commands.forEach((command) => {
          if (command.name === '_execute_action') {
            shortCutKey = command.shortcut
          } else if (command.name === 'show-floating-menu') {
            floatingMenuShortCutKey = command.shortcut
          }
        })
        setCommands(commands as any)
      } else {
        setCommands([])
      }
      setChatBoxShortCutKey(shortCutKey)
      setFloatingMenuShortCutKey(floatingMenuShortCutKey)
    }
    window.addEventListener('focus', updateCommandKey)
    updateCommandKey().then(() => {
      if (destroyed) {
        return
      }
      setLoaded(true)
    })
    return () => {
      destroyed = true
      window.removeEventListener('focus', updateCommandKey)
    }
  }, [])
  return {
    loaded,
    chatBoxShortCutKey,
    floatingMenuShortCutKey,
    commands,
  }
}
export default useCommands
