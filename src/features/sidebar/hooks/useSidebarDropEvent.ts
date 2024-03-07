import { useCallback } from 'react'
import { atom, useRecoilState } from 'recoil'

import { MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID } from '@/features/common/constants'
import { useUploadImagesAndSwitchToMaxAIVisionModel } from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'

const IsSidebarDragOverAtom = atom({
  key: 'SidebarDragOverAtom',
  default: false,
})

const useSidebarDropEvent = () => {
  const { uploadImagesAndSwitchToMaxAIVisionModel } =
    useUploadImagesAndSwitchToMaxAIVisionModel()

  const [isSidebarDragOver, setIsSidebarDragOver] = useRecoilState(
    IsSidebarDragOverAtom,
  )

  const handleDragEnter = useCallback((event: any) => {
    event.preventDefault()
    setIsSidebarDragOver(true)
  }, [])

  const handleDragOver = useCallback((event: any) => {
    event.preventDefault()
  }, [])

  const handleDragLeave = useCallback((event: any) => {
    // 获取事件的相关目标
    const relatedTarget = event.relatedTarget

    const relatedTargetOffsetParent = relatedTarget?.offsetParent

    // 检查相关目标是否还在外层div内
    if (
      relatedTarget &&
      !(
        relatedTargetOffsetParent &&
        relatedTargetOffsetParent?.id === MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID
      ) &&
      !event.currentTarget.contains(relatedTarget)
    ) {
      // 设置你的状态为false
      setIsSidebarDragOver(false)
    }
  }, [])

  const handleDrop = async (event: any) => {
    const file = event.dataTransfer.files[0]

    const isImage = file.type.includes('image')
    const isPDF = file.type.includes('pdf')

    if (isImage) {
      event.preventDefault()

      uploadImagesAndSwitchToMaxAIVisionModel([file])
    }

    if (isPDF) {
      event.stopPropagation()
      // do nothing
      // 用浏览器的默认打开文件行为来打开 pdf 文件，然后 插件会代理 pdf 文件预览 转为 maxai pdf viewer
    }

    setIsSidebarDragOver(false)
  }

  return {
    isSidebarDragOver,
    setIsSidebarDragOver,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}

export default useSidebarDropEvent
