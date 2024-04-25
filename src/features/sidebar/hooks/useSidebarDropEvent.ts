import { useCallback } from 'react'
import { atom, useRecoilState } from 'recoil'

import useMaxAIModelUploadFile from '@/features/chatgpt/hooks/upload/useMaxAIModelUploadFile'
import { MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID } from '@/features/common/constants'

const IsSidebarDragOverAtom = atom({
  key: 'SidebarDragOverAtom',
  default: false,
})

const useSidebarDropEvent = () => {
  const { isContainMaxAIModelUploadFile, uploadFilesToMaxAIModel } =
    useMaxAIModelUploadFile()

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
      (relatedTarget &&
        !(
          relatedTargetOffsetParent &&
          relatedTargetOffsetParent?.id === MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID
        ) &&
        !event.currentTarget.contains(relatedTarget)) ||
      !relatedTarget
    ) {
      // 设置你的状态为false
      setIsSidebarDragOver(false)
    }
  }, [])

  const handleDrop = async (event: DragEvent) => {
    const { items } = event.dataTransfer || {}
    if (!items || !items.length) {
      setIsSidebarDragOver(false)
      return
    }
    const files = Array.from(items)
      .map((item) => item?.getAsFile?.() || null)
      .filter((file): file is File => file !== null)
    if (files.length > 0) {
      const isPDF = files[0]?.type.includes('pdf')
      if (isPDF) {
        event.stopPropagation()
        // do nothing
        // 用浏览器的默认打开文件行为来打开 pdf 文件，然后 插件会代理 pdf 文件预览 转为 maxai pdf viewer
      } else if (isContainMaxAIModelUploadFile(files)) {
        event.preventDefault()
        setIsSidebarDragOver(false)
        await uploadFilesToMaxAIModel(files)
      }
    }
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
