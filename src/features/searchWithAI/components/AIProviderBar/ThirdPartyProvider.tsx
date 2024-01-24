import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect } from 'react'

import { PreChangeCheckerTooltip } from '@/features/searchWithAI/components/AIProviderBar'
import SearchWIthAIProviderIcon from '@/features/searchWithAI/components/SearchWIthAIProviderIcon'
import {
  ISearchWithAIProviderType,
  SEARCH_WITH_AI_PROVIDER_MAP,
} from '@/features/searchWithAI/constants'
import SearchWithAIProviderOptions, {
  ISearchWithAIProviderOptionsType,
} from '@/features/searchWithAI/constants/searchWithAIProviderOptions'
import useSearchWithProvider from '@/features/searchWithAI/hooks/useSearchWithProvider'

import { getSearchWithAIRootElement } from '../../utils'

interface IProps {
  onProviderChange?: () => void
  disabled?: boolean
}

// 默认值渲染 isThirdParty: true 的 provider
const thirdPartyProviderList = SearchWithAIProviderOptions.filter(
  (provider) => provider.isThirdParty,
)

const ThirdPartyProvider: FC<IProps> = ({ onProviderChange, disabled }) => {
  // 最近一次使用的 third part provider
  const [
    lastUsedThirdPartyProvider,
    setLastUsedThirdPartyProvider,
  ] = React.useState<ISearchWithAIProviderType | null>(null)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const menuOpenTimer = React.useRef<number | null>(null)

  const {
    provider: currentProvider,
    updateChatGPTProvider,
    loading,
  } = useSearchWithProvider()

  // 显示在 third party icon button 上的 provider
  const currentShowThirdPartyProvider = React.useMemo(() => {
    // 判断当前 provider 是否是第三方 provider
    // 如果是 则返回当前 provider
    // 不是 则用 Bing 做默认显示的icon
    const currentProviderIsThirdParty = thirdPartyProviderList.some(
      (provider) => provider.value === currentProvider,
    )
    if (currentProviderIsThirdParty) {
      return currentProvider
    }

    if (lastUsedThirdPartyProvider) {
      return lastUsedThirdPartyProvider
    }

    return SEARCH_WITH_AI_PROVIDER_MAP.BING
  }, [currentProvider, lastUsedThirdPartyProvider])

  const currentShowThirdPartyProviderLabel = React.useMemo(() => {
    const currentProviderIsThirdPartyOption = thirdPartyProviderList.find(
      (provider) => provider.value === currentShowThirdPartyProvider,
    )
    if (currentProviderIsThirdPartyOption) {
      return currentProviderIsThirdPartyOption.label
    }

    return ''
  }, [currentShowThirdPartyProvider])

  const isProviderActive = (provider: ISearchWithAIProviderType) => {
    return currentProvider === provider
  }

  const handleOpenMenu = () => {
    const searchWithAIContainer = getSearchWithAIRootElement()
    const btnContainer = searchWithAIContainer.querySelector<HTMLElement>(
      '.search-with-ai-third-party-provider-button',
    )
    if (btnContainer) {
      setAnchorEl(btnContainer)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleChangeProvider = async (value: ISearchWithAIProviderType) => {
    await updateChatGPTProvider(value)
    setLastUsedThirdPartyProvider(value)
    onProviderChange && onProviderChange()
    handleClose()
  }

  useEffect(() => {
    const currentProviderIsThirdParty = thirdPartyProviderList.some(
      (provider) => provider.value === currentProvider,
    )
    if (currentProviderIsThirdParty) {
      setLastUsedThirdPartyProvider(currentProvider)
    }
  }, [currentProvider])

  const renderThirdProviderIcon = (
    thirdPartyProvider: ISearchWithAIProviderOptionsType,
  ) => {
    const thirdPartyProviderMenuItem = (
      <MenuItem
        key={thirdPartyProvider.value}
        selected={isProviderActive(thirdPartyProvider.value)}
        onClick={() => {
          handleChangeProvider(thirdPartyProvider.value)
        }}
      >
        <Stack direction={'row'} spacing={1} alignItems="center">
          <SearchWIthAIProviderIcon
            aiProviderType={thirdPartyProvider.value}
            isActive={true}
          />
          <Typography fontSize={14}>{thirdPartyProvider.label}</Typography>
        </Stack>
      </MenuItem>
    )

    if (thirdPartyProvider.preChangeChecker) {
      return (
        <PreChangeCheckerTooltip {...thirdPartyProvider.preChangeChecker}>
          {thirdPartyProviderMenuItem}
        </PreChangeCheckerTooltip>
      )
    }

    return thirdPartyProviderMenuItem
  }

  return (
    <>
      <Tooltip
        open={tooltipOpen}
        onClose={() => {
          setTooltipOpen(false)
        }}
        PopperProps={{
          disablePortal: true,
        }}
        title={
          <Typography fontSize={12}>
            3rd-party AI provider
            {currentShowThirdPartyProviderLabel
              ? `: ${currentShowThirdPartyProviderLabel}`
              : ''}
          </Typography>
        }
        placement="top"
      >
        <span>
          <IconButton
            className="search-with-ai-provider-button search-with-ai-third-party-provider-button"
            sx={{
              p: 1,
              borderRadius: 0,
              bgcolor: (t) => {
                if (isProviderActive(currentShowThirdPartyProvider)) {
                  return t.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.23) !important'
                    : 'rgba(0, 0, 0, 0.12) !important'
                } else {
                  return 'transparent'
                }
              },

              '&.Mui-disabled': {
                cursor: 'not-allowed',
              },
            }}
            disabled={loading || disabled}
            onClick={() => {
              if (menuOpenTimer.current) {
                window.clearTimeout(menuOpenTimer.current)
              }
              handleChangeProvider(currentShowThirdPartyProvider)
            }}
            onMouseEnter={() => {
              setTooltipOpen(true)
              if (menuOpenTimer.current) {
                window.clearTimeout(menuOpenTimer.current)
              }
              menuOpenTimer.current = window.setTimeout(handleOpenMenu, 500)
            }}
            onMouseLeave={() => {
              setTooltipOpen(false)
              if (menuOpenTimer.current) {
                window.clearTimeout(menuOpenTimer.current)
              }
              menuOpenTimer.current = window.setTimeout(handleClose, 100)
            }}
          >
            <SearchWIthAIProviderIcon
              aiProviderType={currentShowThirdPartyProvider}
              isActive={isProviderActive(currentShowThirdPartyProvider)}
            />

            <KeyboardArrowDownOutlinedIcon
              sx={{
                fontSize: 20,
                ml: 0.5,
              }}
            />
          </IconButton>
        </span>
      </Tooltip>

      <Popper anchorEl={anchorEl} open={open} placement="bottom-end">
        <Paper
          sx={{
            mt: '1px',
          }}
          onMouseEnter={() => {
            if (menuOpenTimer.current) {
              window.clearTimeout(menuOpenTimer.current)
            }
            menuOpenTimer.current = window.setTimeout(handleOpenMenu, 500)
          }}
          onMouseLeave={() => {
            if (menuOpenTimer.current) {
              window.clearTimeout(menuOpenTimer.current)
            }

            menuOpenTimer.current = window.setTimeout(handleClose, 100)
          }}
        >
          <MenuList>
            {thirdPartyProviderList.map((provider) =>
              renderThirdProviderIcon(provider),
            )}
          </MenuList>
        </Paper>
      </Popper>
    </>
  )
}

export default ThirdPartyProvider
