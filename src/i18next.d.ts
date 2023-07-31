// import the original type declarations
import 'i18next'
import defaultEnResource from '@/i18n/locales/en/index.json'

export type I18nextResources = typeof defaultEnResource
export type I18nextKeysType =
  | `common:${keyof I18nextResources['common']}`
  | `settings:${keyof I18nextResources['settings']}`
  | `client:${keyof I18nextResources['client']}`

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom resources type
    resources: I18nextResources
  }
}
