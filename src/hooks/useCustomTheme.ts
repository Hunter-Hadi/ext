import { AppSettingsState } from '@/store'
import { getChromeExtensionSettings, setChromeExtensionSettings } from '@/utils'
import { createTheme, responsiveFontSizes, Theme } from '@mui/material/styles'
import React, { useMemo, useState } from 'react'
import { useRecoilValue } from 'recoil'
// import { useTernaryDarkMode } from 'usehooks-ts';

const APP_ENV = process.env.APP_ENV

type CustomColor = {
  main: React.CSSProperties['color']
  borderColor: React.CSSProperties['color']
  background: React.CSSProperties['color']
  paperBackground: React.CSSProperties['color']
}

export const customColor = {
  main: APP_ENV === 'EZ_MAIL_AI' ? '#DB4437' : '#7601D3',
  darkMain: APP_ENV === 'EZ_MAIL_AI' ? '#DB4437' : '#F1E2FD',
  // borderColor: getIsDarkMode()
  //   ? 'rgba(255, 255, 255, 0.12)'
  //   : 'rgb(237,237,236)',
  // background: getIsDarkMode() ? '#14162a' : '#ffffff',
  // paperBackground: getIsDarkMode() ? '#292b42' : '#ffffff',

  lightBorderColor: 'rgb(237,237,236)',
  lightBackground: '#fff',
  lightPaperBackground: '#fff',

  darkBorderColor: 'rgba(255, 255, 255, 0.12)',
  darkBackground: '#14162a',
  darkPaperBackground: '#292b42',
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

interface IProps {
  isDarkMode: boolean
  customTheme: Theme
}

export const useCustomTheme = (shadowRootElement?: HTMLElement): IProps => {
  const AppSettings = useRecoilValue(AppSettingsState)

  // React.useEffect(() => {
  //   if (AppSettings.colorSchema) return
  //   setChromeExtensionSettings({
  //     colorSchema: window.matchMedia('(prefers-color-scheme: dark)').matches
  //       ? 'dark'
  //       : 'light',
  //   })
  // }, [])

  const isDarkMode = useMemo(() => {
    return AppSettings.colorSchema === 'dark'
  }, [AppSettings.colorSchema])

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

  console.log('useCustomTheme AppSettings', theme, isDarkMode)

  return {
    isDarkMode: isDarkMode,
    customTheme: theme,
  }
}
