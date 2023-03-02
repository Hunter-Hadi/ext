import React from 'react'
import { createTheme, responsiveFontSizes } from '@mui/material'
const getIsDarkMode = () => {
  // 20221121 强制 light mode
  return false
}

type CustomColor = {
  main: React.CSSProperties['color']
  lightBackground: React.CSSProperties['color']
  darkBackground: React.CSSProperties['color']
  darkPaperBackground: React.CSSProperties['color']
}

export const customColor = {
  main: '#1D56D7',
  lightBackground: '#f7f9fd',
  darkBackground: '#14162a',
  darkPaperBackground: '#292b42',
}

declare module '@mui/material/styles' {
  interface Palette {
    customColor: CustomColor
  }
  interface PaletteOptions {
    customColor: CustomColor
  }
}

const customMuiTheme = (shadowRootElement?: HTMLElement) => {
  return responsiveFontSizes(
    createTheme({
      components: {
        MuiButton: {
          defaultProps: {
            disableElevation: true,
          },
          styleOverrides: {
            root: {
              fontSize: '14px',
              textTransform: 'none',
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              textTransform: 'none',
            },
          },
        },
        MuiToolbar: {
          styleOverrides: {
            root: {
              width: '100%',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              outline: 'none',
            },
          },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
            },
          },
        },
        MuiPopover: {
          defaultProps: {
            container: shadowRootElement || document.body,
          },
        },
        MuiPopper: {
          defaultProps: {
            container: shadowRootElement || document.body,
          },
        },
        MuiModal: {
          defaultProps: {
            container: shadowRootElement || document.body,
          },
        },
      },
      palette: {
        primary: {
          main: customColor.main,
        },
        mode: getIsDarkMode() ? 'dark' : 'light',
        background: {
          paper: getIsDarkMode() ? customColor.darkPaperBackground : '#ffffff',
          default: getIsDarkMode() ? customColor.darkBackground : '#ffffff',
        },
        customColor: customColor,
      },
      breakpoints: {
        values: {
          xs: 320,
          sm: 768,
          md: 1024,
          lg: 1280,
          xl: 1440,
        },
      },
    }),
  )
}

export default customMuiTheme
