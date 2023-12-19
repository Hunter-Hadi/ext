import { useEffect, useState } from 'react'
import { elementCheckVisibility } from '@/utils/dataHelper/elementHelper'

const useFindElement = (
  selector: string,
  config?: {
    interval?: number
    style?: string
  },
) => {
  const [element, setElement] = useState<HTMLElement | undefined>(undefined)
  const [elements, setElements] = useState<HTMLElement[]>([])
  const { interval = 1000, style } = config || {}
  useEffect(() => {
    const timer = setInterval(() => {
      if (!element) {
        const elements = document.querySelectorAll(selector)
        console.log('useFindElement', elements)
        if (elements.length > 0) {
          const matchElements = Array.from(elements).map((element) => {
            if (style) {
              element.setAttribute('style', style)
            }
            return element
          }) as HTMLElement[]
          setElements(matchElements)
          setElement(matchElements[0])
        }
      }
    }, interval)
    return () => {
      timer && clearInterval(timer)
    }
  }, [selector, interval, element])
  useEffect(() => {
    const timer = setInterval(() => {
      if (element) {
        console.log('useFindElement setInterval', elements)
        if (elementCheckVisibility(element)) {
          console.log('useFindElement setInterval 在')
          return
        }
        console.log('useFindElement setInterval 不在')
        setElement(undefined)
        setElements([])
      }
    }, 1000)
    return () => {
      timer && clearInterval(timer)
    }
  }, [element])
  return {
    elements,
    element,
  }
}
export default useFindElement
