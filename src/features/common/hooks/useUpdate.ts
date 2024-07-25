import { useState } from 'react'

export default function useUpdate() {
  const [, update] = useState([])

  return () => {
    update([])
  }
}
