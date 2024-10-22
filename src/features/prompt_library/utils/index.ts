import { OptionsObject, SnackbarMessage } from 'notistack'

import { DEFAULT_PROMPT_VARIABLE } from '@/features/prompt_library/constant'
import { IPromptLibraryCardDetailVariable } from '@/features/prompt_library/types'
import Toast from '@/utils/globalSnackbar'

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
export const isLiveCrawling = (
  variables?: IPromptLibraryCardDetailVariable[],
) => {
  if (!variables) {
    return false
  }
  return variables.some((variable) => variable.type === 'livecrawling')
}

const variableTypeWithInputVariable: Record<string, string[]> = {
  livecrawling: ['Live Crawling Target URL'],
  websearch: ['Web Search Query'],
}
// 1. 如果 variable_types 包含了系统预设变量的类型，但是又没有该变量类型的 input variable（比如url、query），则需要添加一个
export const handleVariableTypeWithInputVariable = (
  variables: IPromptLibraryCardDetailVariable[],
  variableTypes: string[],
) => {
  if (variableTypes.length > 0 && variables) {
    const withInputVariableTypes = Object.keys(variableTypeWithInputVariable)
    variableTypes.forEach((type) => {
      if (withInputVariableTypes.includes(type)) {
        const currentTypeInputVariables: IPromptLibraryCardDetailVariable[] = []
        variableTypeWithInputVariable[type].forEach((withTypeVariable) => {
          const inputVariable = DEFAULT_PROMPT_VARIABLE.find(
            (item) => item.name === withTypeVariable,
          )
          inputVariable && currentTypeInputVariables.push(inputVariable)
        })
        if (currentTypeInputVariables.length > 0) {
          const newInsertInputVariables = currentTypeInputVariables?.filter(
            (variable) => {
              return !variables?.some((item) => item.name === variable.name)
            },
          )
          if (newInsertInputVariables && newInsertInputVariables.length > 0) {
            variables = variables?.concat(newInsertInputVariables)
          }
        }
      }
    })
  }

  return variables
}
