import { atom } from 'recoil'

/**
 * 检测MaxAI插件是否安装的atom sate
 */
export const MaxAIChromeExtensionDetectorState = atom<{
  checkIsInstalled: () => boolean
}>({
  key: 'MaxAIChromeExtensionDetectorState',
  default: {
    checkIsInstalled: () => {
      return false
    },
  },
})
