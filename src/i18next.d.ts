// import the original type declarations
import 'i18next'
import defaultEnResource from '@/i18n/locales/en/index.json'

export type I18nextResources = typeof defaultEnResource

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom resources type
    resources: I18nextResources
  }
}
