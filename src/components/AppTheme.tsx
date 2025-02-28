import ThemeProvider from '@mui/material/styles/ThemeProvider'
import React, { FC, PropsWithChildren } from 'react'

import { useCustomTheme } from '@/hooks/useCustomTheme'

interface IProps {
  shadowRootElement?: HTMLElement
}

const AppThemeProvider: FC<PropsWithChildren<IProps>> = (props) => {
  const { customTheme } = useCustomTheme({
    shadowRootElement: props.shadowRootElement,
  })
  return <ThemeProvider theme={customTheme} {...props} />
}
export default AppThemeProvider
