import { TFunction } from 'i18next/index.v4'
import React from 'react'

export const MAXAI_VISION_MODEL_UPLOAD_CONFIG: {
  accept: string
  acceptTooltip: (t: TFunction<['common', 'client']>) => React.ReactNode
  maxFileSize: number
  maxCount: number
} = {
  maxFileSize: 20 * 1024 * 1024, // 20
  // TODO .pdf,.doc,.docx,.rtf,.epub,.odt,.odp,.pptx,
  accept:
    '.pdf,.txt,.py,.ipynb,.js,.jsx,.html,.css,.java,.cs,.php,.c,.cpp,.cxx,.h,.hpp,.rs,.R,.Rmd,.swift,.go,.rb,.kt,.kts,.ts,.tsx,.m,.scala,.rs,.dart,.lua,.pl,.pm,.t,.sh,.bash,.zsh,.csv,.log,.ini,.config,.json,.yaml,.yml,.toml,.lua,.sql,.bat,.md,.coffee,.tex,.latex,.jpg,.jpeg,.png,.gif,.webp',
  acceptTooltip: (t) =>
    t('client:provider__chatgpt__upload__accept_docs_and_images_tooltip'),
  maxCount: 5,
}

export const MAXAI_NORMAL_MODEL_UPLOAD_CONFIG: {
  accept: string
  acceptTooltip: (t: TFunction<['common', 'client']>) => React.ReactNode
  maxFileSize: number
  maxCount: number
} = {
  maxFileSize: 5 * 1024 * 1024, // 20
  // TODO .pdf,.doc,.docx,.rtf,.epub,.odt,.odp,.pptx,
  accept:
    '.pdf,.txt,.py,.ipynb,.js,.jsx,.html,.css,.java,.cs,.php,.c,.cpp,.cxx,.h,.hpp,.rs,.R,.Rmd,.swift,.go,.rb,.kt,.kts,.ts,.tsx,.m,.scala,.rs,.dart,.lua,.pl,.pm,.t,.sh,.bash,.zsh,.csv,.log,.ini,.config,.json,.yaml,.yml,.toml,.lua,.sql,.bat,.md,.coffee,.tex,.latex',
  acceptTooltip: (t) =>
    t('client:provider__chatgpt__upload__accept_docs_tooltip'),
  maxCount: 5,
}
