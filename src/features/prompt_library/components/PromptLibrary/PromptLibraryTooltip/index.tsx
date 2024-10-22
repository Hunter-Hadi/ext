import Tooltip, { TooltipProps } from '@mui/material/Tooltip'
import React, { FC, useContext } from 'react'

import { PromptLibraryRuntimeContext } from '@/features/prompt_library/store'
import { getMaxAISidebarRootElement } from '@/utils'

const PromptLibraryTooltip: FC<TooltipProps> = (props) => {
  const { promptLibraryRuntime } = useContext(PromptLibraryRuntimeContext)!
  return (
    <Tooltip
      {...props}
      PopperProps={{
        ...props?.PopperProps,
        sx: {
          ...props?.PopperProps?.sx,
          zIndex: 2147483621,
        },
        container:
          promptLibraryRuntime === 'WebPage'
            ? document.body
            : getMaxAISidebarRootElement(),
      }}
    />
  )
}
export default PromptLibraryTooltip
