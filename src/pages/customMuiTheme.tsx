import React from 'react'
import { createTheme, responsiveFontSizes } from '@mui/material'
const getIsDarkMode = () => {
  // 20221121 强制 light mode
  console.log('getIsDarkMode')
  return true
}

const APP_ENV = process.env.APP_ENV

type CustomColor = {
  main: React.CSSProperties['color']
  borderColor: React.CSSProperties['color']
  background: React.CSSProperties['color']
  paperBackground: React.CSSProperties['color']
}

export const customColor = {
  main: APP_ENV === 'EZ_MAIL_AI' ? '#DB4437' : '#7601D3',
  borderColor: getIsDarkMode()
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgb(237,237,236)',
  background: getIsDarkMode() ? '#14162a' : '#ffffff',
  paperBackground: getIsDarkMode() ? '#292b42' : '#ffffff',
}

declare module '@mui/material/styles' {
  interface Palette {
    customColor: CustomColor
    neutral: Palette['primary']
  }
  interface PaletteOptions {
    customColor: CustomColor
    neutral: PaletteOptions['primary']
  }
}

const customMuiTheme = (shadowRootElement?: HTMLElement) => {
  return responsiveFontSizes(
    createTheme({
      components: {
        // MuiCssBaseline: {
        //   styleOverrides: {
        //     body: {
        //       backgroundColor: getIsDarkMode()
        //         ? customColor.paperBackground
        //         : '#fff',
        //       color: getIsDarkMode() ? '#fff' : 'rgba(0, 0, 0, 0.87)',
        //     },
        //   },
        // },
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
          paper: customColor.paperBackground,
          default: customColor.background,
        },
        customColor: customColor,
        neutral: {
          main: 'rgba(0, 0, 0, 0.4)',
          contrastText: 'rgba(0, 0, 0, 0.6)',
        },
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
