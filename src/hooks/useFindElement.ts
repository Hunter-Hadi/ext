import { useEffect, useState } from 'react'
import { elementCheckVisibility } from '@/utils/dataHelper/elementHelper'

const useFindElement = (
  selector: string,
  config?: {
    interval?: number
  },
) => {
  const [element, setElement] = useState<HTMLElement | undefined>(undefined)
  const [elements, setElements] = useState<HTMLElement[]>([])
  const { interval = 1000 } = config || {}
  useEffect(() => {
    const timer = setInterval(() => {
      if (!element) {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          setElements(Array.from(elements) as HTMLElement[])
          setElement(elements[0] as HTMLElement)
        }
      }
    }, interval)
    return () => {
      timer && clearInterval(timer)
      setElement(undefined)
      setElements([])
    }
  }, [selector, interval])
  useEffect(() => {
    const timer = setInterval(() => {
      if (element) {
        if (elementCheckVisibility(element)) {
          return
        }
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
