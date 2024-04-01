type ValueOf<T> = T[keyof T]

declare module '*.less' {
  const value: string
  export default value
}
export { IChromeExtensionDBStorageUpdateFunction } from '@/background/utils'
export { IChromeExtensionDBStorage } from '@/background/utils'
export { IChromeExtensionButtonSettingKey } from '@/background/utils'
export { IChatGPTPluginType } from '@/background/utils'
export { IChatGPTModelType } from '@/background/utils'
export useUploadImagesAndSwitchToMaxAIVisionModel from '@/features/sidebar/hooks/useUploadImagesAndSwitchToMaxAIVisionModel'
