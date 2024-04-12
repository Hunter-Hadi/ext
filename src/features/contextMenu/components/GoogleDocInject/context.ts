import { createContext, useContext } from 'react'

import {
  GoogleDocController,
  IGoogleDocCaret,
  IGoogleDocSelection,
} from '@/features/contextMenu/utils/googleDocController'

export interface IGoogleDocContext {
  control?: GoogleDocController
  caret: IGoogleDocCaret | null
  selection: IGoogleDocSelection | null
  focus: boolean
}

export const GoogleDocContext = createContext<IGoogleDocContext>({
  caret: null,
  selection: null,
  focus: false,
})

export const useGoogleDocContext = () => useContext(GoogleDocContext)
