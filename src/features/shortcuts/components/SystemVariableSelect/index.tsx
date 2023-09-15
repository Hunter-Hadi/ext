import React, { FC } from 'react'
import {
  ISystemVariableSelectKey,
  SystemVariableSelectProps,
} from '@/features/shortcuts/components/SystemVariableSelect/types'
import { SystemVariableWritingStyleSelect } from '@/features/shortcuts/components/SystemVariableSelect/SystemVariableWritingStyleSelect'
import { SystemVariableLanguageSelect } from '@/features/shortcuts/components/SystemVariableSelect/SystemVariableLanguageSelect'
import { SystemVariableToneSelect } from '@/features/shortcuts/components/SystemVariableSelect/SystemVariableToneSelect'

const SystemVariableSelect: FC<
  SystemVariableSelectProps & {
    systemVariableSelectKey: ISystemVariableSelectKey
  }
> = (props) => {
  const { systemVariableSelectKey, ...rest } = props
  switch (systemVariableSelectKey) {
    case 'AI_RESPONSE_WRITING_STYLE':
      return <SystemVariableWritingStyleSelect {...rest} />
    case 'AI_RESPONSE_LANGUAGE':
      return <SystemVariableLanguageSelect {...rest} />
    case 'AI_RESPONSE_TONE':
      return <SystemVariableToneSelect {...rest} />
    default:
      return null
  }
}
export default SystemVariableSelect
