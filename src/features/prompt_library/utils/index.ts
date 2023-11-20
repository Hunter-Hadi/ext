import Toast from '@/utils/globalSnackbar'
import { OptionsObject, SnackbarMessage } from 'notistack'
import { IPromptVariable } from '@/features/prompt_library/types'
export const promptActionToast = {
  success: (msg: SnackbarMessage, options: OptionsObject = {}) =>
    Toast.success(msg, {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
      ...options,
    }),
  warning: (msg: SnackbarMessage, options: OptionsObject = {}) =>
    Toast.warning(msg, {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
      ...options,
    }),
  info: (msg: SnackbarMessage, options: OptionsObject = {}) =>
    Toast.info(msg, {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
      ...options,
    }),
  error: (msg: SnackbarMessage, options: OptionsObject = {}) =>
    Toast.error(msg, {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
      ...options,
    }),
}
export const isLiveCrawling = (variables?: IPromptVariable[]) => {
  if (!variables) {
    return false
  }
  return variables.some((variable) => variable.type === 'livecrawling')
}
