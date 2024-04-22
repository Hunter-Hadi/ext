import { useRecoilState } from 'recoil'

import { VideoPopupAtom } from '@/features/video_popup/store'

const useVideoPopupController = () => {
  const [videoPopupState, setVideoPopupState] = useRecoilState(VideoPopupAtom)

  const openVideoPopup = (videoSrc: string) => {
    setVideoPopupState((preState) => ({
      ...preState,
      videoSrc: videoSrc,
      open: true,
    }))
  }

  const closeVideoPopup = () => {
    setVideoPopupState((preState) => ({
      ...preState,
      videoSrc: '',
      open: false,
    }))
  }

  return {
    open: videoPopupState.open,
    videoSrc: videoPopupState.videoSrc,
    openVideoPopup,
    closeVideoPopup,
  }
}

export default useVideoPopupController
