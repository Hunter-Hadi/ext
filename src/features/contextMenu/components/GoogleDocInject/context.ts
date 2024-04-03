import { createContext, useContext } from 'react'

import {
  GoogleDocControl,
  IGoogleDocSelection,
  IGoogleDocText,
} from '@/features/contextMenu/utils/googleDocHelper'

export interface IGoogleDocContext {
  control?: GoogleDocControl
  selection?: IGoogleDocSelection
  selectionTexts: IGoogleDocText[]
}

export const GoogleDocContext = createContext<IGoogleDocContext>({
  selectionTexts: []
})

export const useGoogleDocContext = () => useContext(GoogleDocContext)
