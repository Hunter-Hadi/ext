import { useEffect, useState } from 'react'
import { getChromeExtensionCommands } from '@/background/utils'
import isArray from 'lodash-es/isArray'

const useCommands = () => {
  const [loaded, setLoaded] = useState<boolean>(false)
  const [shortCutKey, setShortCutKey] = useState<undefined | string>(undefined)
  useEffect(() => {
    let destroyed = false
    const updateCommandKey = async () => {
      if (destroyed) {
        return
      }
      const commands = await getChromeExtensionCommands()
      if (isArray(commands) && commands.length > 0) {
        const shortCutCommand = commands.find((command) => {
          return command.name === '_execute_action'
        })
        if (shortCutCommand) {
          setShortCutKey(shortCutCommand?.shortcut)
        }
      } else {
        setShortCutKey(undefined)
      }
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
    shortCutKey,
  }
}
export default useCommands
