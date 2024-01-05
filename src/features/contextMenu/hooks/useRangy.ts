import { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'

import { clientGetCurrentClientAIProviderAndModel } from '@/features/chatgpt/utils/clientChatConversation'
import { RangyCoreState, RangyState } from '@/features/contextMenu/store'
import { ISelection } from '@/features/contextMenu/types'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'

const useRangy = () => {
  const [rangyCore, setRangyCore] = useRecoilState(RangyCoreState)
  const [rangy, setRangy] = useRecoilState(RangyState)
  const hideRangy = (force = false) => {
    setRangy((prevState) => {
      console.log('[ContextMenu Module]: clear', force)
      document.querySelector('#rangeBorderBox')?.remove()
      return {
        show: false,
        tempSelection: null,
        currentSelection: force ? null : prevState.currentSelection,
      }
    })
  }
  const initRangyCore = (rangyCore: any) => {
    setRangyCore({
      loaded: true,
      rangy: rangyCore,
    })
  }
  const showRangy = () => {
    console.log('[ContextMenu Module]: show')
    setRangy((prevState) => {
      return {
        ...prevState,
        show: true,
      }
    })
  }
  const saveTempSelection = (selection: ISelection) => {
    setRangy((prevState) => {
      return {
        ...prevState,
        tempSelection: selection,
      }
    })
  }

  const saveCurrentSelection = async (selection: ISelection) => {
    const { currentModel } = await clientGetCurrentClientAIProviderAndModel()

    // 当前models最大可用tokens
    const maxTokens = currentModel?.maxTokens || 4096
    // 预留给output的tokens
    const bufferTokens = maxTokens / 4
    // 剩余可用tokens
    const sliceTokens = maxTokens - bufferTokens
    console.log(
      `[ContextMenu Module]: saveCurrentSelection [${sliceTokens} tokens]`,
      selection,
    )
    selection.selectionText = (
      await sliceTextByTokens(selection.selectionText || '', sliceTokens)
    ).text
    setRangy((prevState) => {
      return {
        ...prevState,
        currentSelection: selection,
      }
    })
  }
  const tempSelectionRef = useRef<ISelection | null>(rangy.tempSelection)
  useEffect(() => {
    tempSelectionRef.current = rangy.tempSelection
  }, [rangy.tempSelection])
  const currentSelectionRef = useRef<ISelection | null>(rangy.currentSelection)
  useEffect(() => {
    currentSelectionRef.current = rangy.currentSelection
  }, [rangy.currentSelection])
  return {
    showRangy,
    hideRangy,
    rangy: rangyCore.rangy,
    initRangyCore,
    saveCurrentSelection,
    saveTempSelection,
    show: rangy.show,
    tempSelection: rangy.tempSelection,
    currentSelection: rangy.currentSelection,
    tempSelectionRef,
    currentSelectionRef,
  }
}
export { useRangy }
