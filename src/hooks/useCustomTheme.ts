import { createTheme, responsiveFontSizes, Theme } from '@mui/material/styles'
import React, { useMemo } from 'react'
import { useRecoilValue } from 'recoil'

import { AppDBStorageState } from '@/store'
// import { useTernaryDarkMode } from 'usehooks-ts';

type CustomColor = {
  main: React.CSSProperties['color']
  borderColor: React.CSSProperties['color']
  background: React.CSSProperties['color']
  paperBackground: React.CSSProperties['color']
}

export const customColor = {
  main: '#7601D3',
  darkMain: '#B273FF',
  // borderColor: getIsDarkMode()
  //   ? 'rgba(255, 255, 255, 0.12)'
  //   : 'rgb(237,237,236)',
  // background: getIsDarkMode() ? '#14162a' : '#ffffff',
  // paperBackground: getIsDarkMode() ? '#292b42' : '#ffffff',

  lightBorderColor: 'rgb(237,237,236)',
  lightBackground: '#fff',
  lightPaperBackground: '#fff',

  darkBorderColor: 'rgba(255, 255, 255, 0.2)',
  darkBackground: '#202124',
  darkPaperBackground: '#2C2C2C',
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
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    secondary: true
    normalOutlined: true
  }
}

interface IUseCustomThemeReturn {
  isDarkMode: boolean
  customTheme: Theme
}

interface IProps {
  shadowRootElement?: HTMLElement
  colorSchema?: 'light' | 'dark'
}

export const useCustomTheme = (props?: IProps): IUseCustomThemeReturn => {
  const { shadowRootElement, colorSchema } = props || {}
  const appDBStorage = useRecoilValue(AppDBStorageState)
  const isDarkMode = useMemo(() => {
    if (colorSchema !== undefined) {
      return colorSchema === 'dark'
    }
    if (appDBStorage.userSettings?.colorSchema === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return appDBStorage.userSettings?.colorSchema === 'dark'
  }, [appDBStorage.userSettings, colorSchema])

  const theme = React.useMemo(() => {
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
          MuiTooltip: {
            defaultProps: {},
          },
          MuiButton: {
            defaultProps: {
              disableElevation: true,
            },
            styleOverrides: {
              root: {
                fontSize: '14px',
                textTransform: 'none',
              },
              contained: isDarkMode
                ? {
                    backgroundColor: '#6b24c2b3',
                  }
                : {},
              outlined: isDarkMode
                ? {
                    color: '#FFFFFF',
                    borderColor: '#B273FF',
                  }
                : {},
            },
            variants: [
              {
                props: { variant: 'secondary' },
                style: {
                  backgroundColor: isDarkMode
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(0, 0, 0, 0.08)',
                  color: isDarkMode
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(0, 0, 0, 0.38)',
                  '&:hover': {
                    backgroundColor: isDarkMode
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.1)',
                    color: isDarkMode
                      ? 'rgba(255, 255, 255, 0.3)'
                      : 'rgba(0, 0, 0, 0.38)',
                  },
                },
              },
              {
                props: { variant: 'normalOutlined' },
                style: {
                  backgroundColor: 'transparent',
                  border: '1px solid',
                  color: isDarkMode
                    ? 'rgba(255, 255, 255, 1)'
                    : 'rgba(0, 0, 0, 0.87)',
                  borderColor: isDarkMode
                    ? 'rgba(255, 255, 255, 0.23)'
                    : 'rgba(0, 0, 0, 0.23)',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    borderColor: isDarkMode
                      ? 'rgba(255, 255, 255, 1)'
                      : 'rgba(0, 0, 0, 0.87)',
                  },
                },
              },
            ],
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
              sx: {
                fontSize: '14px',
              },
            },
            styleOverrides: {
              root: {
                zIndex: '2147483620',
              },
            },
          },
          MuiPopper: {
            defaultProps: {
              sx: {
                zIndex: '2147483620',
              },
              container: shadowRootElement || document.body,
            },
          },
          MuiModal: {
            defaultProps: {
              container: shadowRootElement || document.body,
            },
            styleOverrides: {
              root: {
                zIndex: '2147483620',
              },
            },
          },
        },
        palette: {
          primary: {
            main: isDarkMode ? customColor.darkMain : customColor.main,
          },
          mode: isDarkMode ? 'dark' : 'light',
          background: {
            paper: isDarkMode
              ? customColor.darkPaperBackground
              : customColor.lightPaperBackground,
            default: isDarkMode
              ? customColor.darkBackground
              : customColor.lightBackground,
          },
          customColor: {
            main: customColor.main,
            borderColor: isDarkMode
              ? customColor.darkBorderColor
              : customColor.lightBorderColor,
            background: isDarkMode
              ? customColor.darkBackground
              : customColor.lightBackground,
            paperBackground: isDarkMode
              ? customColor.darkPaperBackground
              : customColor.lightPaperBackground,
          },
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
  }, [isDarkMode, shadowRootElement])

  return {
    isDarkMode: isDarkMode,
    customTheme: theme,
  }
}
