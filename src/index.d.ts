type ValueOf<T> = T[keyof T]

declare module '*.less' {
  const value: string
  export default value
}
export { IChromeExtensionSettingsUpdateFunction } from './background/types/Settings'
export { IChromeExtensionButtonSettingKey } from './background/types/Settings'
export { IChromeExtensionSettings } from './background/types/Settings'
export { IChatGPTPluginType } from './background/types/Settings'
export { IChatGPTModelType } from './background/types/Settings'
