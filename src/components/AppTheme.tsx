import { useCustomTheme } from '@/hooks/useCustomTheme'
import ThemeProvider from '@mui/material/styles/ThemeProvider'
import React, { FC, PropsWithChildren } from 'react'

interface IProps {
  shadowRootElement?: HTMLElement
}

const AppThemeProvider: FC<PropsWithChildren<IProps>> = (props) => {
  const { customTheme } = useCustomTheme(props.shadowRootElement)
  return <ThemeProvider theme={customTheme} {...props} />
}
export default AppThemeProvider
