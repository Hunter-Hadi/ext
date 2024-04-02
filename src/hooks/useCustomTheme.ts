import { createTheme, responsiveFontSizes, Theme } from '@mui/material/styles'
import React, { useMemo } from 'react'
import { useRecoilValue } from 'recoil'

import { AppDBStorageState } from '@/store'
// import { useTernaryDarkMode } from 'usehooks-ts';

type CustomColor = {
  main: React.CSSProperties['color']
  hoverColor: React.CSSProperties['color']
  borderColor: React.CSSProperties['color']
  background: React.CSSProperties['color']
  paperBackground: React.CSSProperties['color']
  secondaryBackground: React.CSSProperties['color']
}

export const customColor = {
  main: '#9065B0',
  darkMain: '#9065B0',

  hoverColor: '#73518D',
  darkHoverColor: '#A684C0',
  // borderColor: getIsDarkMode()
  //   ? 'rgba(255, 255, 255, 0.12)'
  //   : 'rgb(237,237,236)',
  // background: getIsDarkMode() ? '#14162a' : '#ffffff',
  // paperBackground: getIsDarkMode() ? '#292b42' : '#ffffff',

  lightBorderColor: 'rgba(0,0,0,0.08)',
  lightBackground: '#fff',
  lightPaperBackground: '#fff',
  lightSecondaryBackground: '#F4F4F4',

  darkBorderColor: 'rgba(255, 255, 255, 0.08)',
  darkBackground: '#202124',
  darkPaperBackground: '#2c2c2c',
  darkSecondaryBackground: '#3B3D3E',
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
  interface TypographyVariants {
    custom: React.CSSProperties
  }
  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    custom?: React.CSSProperties
  }
}
// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    custom: true
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
              // @ts-expect-error 为了统一给 Mui Modal 添加 data-testid，
              // 但是 Mui Modal 类型声明没有这个属性，所以这里先让 ts 忽略下面这行类型报错
              'data-testid': 'maxai-mui-modal',
            },
            styleOverrides: {
              root: {
                zIndex: '2147483620',
              },
            },
          },
          MuiAutocomplete: {
            styleOverrides: {
              popper: {
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
            secondaryBackground: isDarkMode
              ? customColor.darkSecondaryBackground
              : customColor.lightSecondaryBackground,
            hoverColor: isDarkMode
              ? customColor.darkHoverColor
              : customColor.hoverColor,
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
