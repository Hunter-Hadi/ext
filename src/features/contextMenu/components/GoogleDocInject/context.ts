import { createContext, useContext } from 'react'

import {
  GoogleDocControl,
  IGoogleDocCaret,
  IGoogleDocSelection,
} from '@/features/contextMenu/utils/googleDocHelper'

export interface IGoogleDocContext {
  control?: GoogleDocControl
  caret: IGoogleDocCaret | null
  selection: IGoogleDocSelection | null
}

export const GoogleDocContext = createContext<IGoogleDocContext>({
  caret: null,
  selection: null
})

export const useGoogleDocContext = () => useContext(GoogleDocContext)
