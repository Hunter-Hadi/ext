import { useCallback } from 'react'
import { atom, useRecoilState } from 'recoil'

import useMaxAIModelUploadFile from '@/features/chatgpt/hooks/upload/useMaxAIModelUploadFile'
import { MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID } from '@/features/common/constants'

const IsSidebarDragOverAtom = atom({
  key: 'SidebarDragOverAtom',
  default: false,
})
// const InSidebarPDFUploadLoadingAtom = atom({
//   key: 'InSidebarPDFUploadLoadingAtom',
//   default: false,
// })

const useSidebarDropEvent = () => {
  const { isContainMaxAIModelUploadFile, uploadFilesToMaxAIModel } =
    useMaxAIModelUploadFile()

  const [isSidebarDragOver, setIsSidebarDragOver] = useRecoilState(
    IsSidebarDragOverAtom,
  )
  // const [inSidebarPDFUploadLoading, setInSidebarPDFUploadLoading] =
  //   useRecoilState(InSidebarPDFUploadLoadingAtom)

  const handleDragEnter = useCallback((event: any) => {
    event.preventDefault()
    setIsSidebarDragOver(true)
  }, [])

  const handleDragOver = useCallback((event: any) => {
    event.preventDefault()
  }, [])

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    // 获取事件的相关目标
    const relatedTarget = event.relatedTarget

    if (!relatedTarget || !(relatedTarget instanceof HTMLElement)) {
      setIsSidebarDragOver(false)
      return
    }

    const relatedTargetOffsetParent = relatedTarget.offsetParent

    // 检查相关目标是否还在外层div内
    if (
      relatedTargetOffsetParent?.id === MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID ||
      event.currentTarget.contains(relatedTarget)
    )
      return

    const root = relatedTarget.getRootNode()

    // 屏蔽处理不含id的textarea，因为这里shadow dom会触发一次leave事件，
    // 直接用contains在shadow dom的情况下会查询不到，
    // 用于处理rewrite页面的添加context的textarea
    if (root instanceof ShadowRoot) {
      const host = root.host
      if (host instanceof HTMLTextAreaElement && !host.id) {
        return
      }
    }

    setIsSidebarDragOver(false)
  }

  const handleDrop = async (event: DragEvent) => {
    setIsSidebarDragOver(false)
    const { items } = event.dataTransfer || {}
    if (!items || !items.length) {
      return
    }
    const files = Array.from(items)
      .map((item) => item?.getAsFile?.() || null)
      .filter((file): file is File => file !== null)
    if (files.length > 0) {
      const isPDF = files[0]?.type.includes('pdf')
      if (isPDF) {
        // TODO: 这里临时先这样处理，现在会出现的情况时，关闭了 settings pdf viewer 时，拖拽 pdf 到 sidebar 中 不会触发 maxai 的 pdf viewer
        // 正在做法应该是，不管 settings pdf viewer 开没开，这里都应该上传pdf 到api，然后返回一个url，然后打开这个url

        // const file = files[0]
        event.stopPropagation()
        // event.preventDefault()
        // try {
        //   setInSidebarPDFUploadLoading(true)
        //   const controller = new AbortController()
        //   const signal = controller.signal
        //   const result = await maxAIFileUpload(file, {
        //     useCase: 'multimodal',
        //     signal,
        //   })
        //   if (result.success && result.file_url) {
        //     chromeExtensionClientOpenPage({
        //       key: 'pdf_viewer',
        //       query: `?pdfUrl=${encodeURIComponent(
        //         result.file_url,
        //       )}&newTab=true`,
        //     })
        //   }
        // } catch (error) {
        //   // do nothing
        //   globalSnackbar.error('Failed to upload pdf, please try again later', {
        //     anchorOrigin: {
        //       vertical: 'top',
        //       horizontal: 'right',
        //     },
        //   })
        // } finally {
        //   setInSidebarPDFUploadLoading(false)
        // }

        // do nothing
        // 用浏览器的默认打开文件行为来打开 pdf 文件，然后 插件会代理 pdf 文件预览 转为 maxai pdf viewer
      } else if (isContainMaxAIModelUploadFile(files)) {
        event.preventDefault()
        await uploadFilesToMaxAIModel(files)
      }
    }
  }

  return {
    // inSidebarPDFUploadLoading,
    isSidebarDragOver,
    setIsSidebarDragOver,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}

export default useSidebarDropEvent
