import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { useCallback, useState } from 'react'
import { FC } from 'react'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import PermissionWrapper from '@/features/auth/components/PermissionWrapper'
import ThirdPartyProvider from '@/features/searchWithAI/components/AIProviderBar/ThirdPartyProvider'
import SearchWIthAIProviderIcon from '@/features/searchWithAI/components/SearchWIthAIProviderIcon'
import { ISearchWithAIProviderType } from '@/features/searchWithAI/constants'
import SearchWithAIProviderOptions, {
  ISearchWithAIProviderOptionsType,
} from '@/features/searchWithAI/constants/searchWithAIProviderOptions'
import useSearchWithProvider from '@/features/searchWithAI/hooks/useSearchWithProvider'
import { getSearchWithAIRootElement } from '@/features/searchWithAI/utils'

interface IProps {
  onProviderChange: () => void
  disabled?: boolean
  sx?: SxProps
}

const AIProviderBar: FC<IProps> = ({ onProviderChange, disabled, sx }) => {
  // TODO: providerList 从 AIProviderOptions 配置中读取
  // 默认值渲染 isThirdParty: false 的 provider
  const providerList = SearchWithAIProviderOptions.filter(
    (provider) => !provider.isThirdParty,
  )

  const {
    provider: currentProvider,
    updateChatGPTProvider,
    loading,
  } = useSearchWithProvider()

  const isProviderActive = (provider: ISearchWithAIProviderType) => {
    return currentProvider === provider
  }

  const renderIcon = (provider: ISearchWithAIProviderOptionsType) => {
    const providerIcon = (
      <IconButton
        className="search-with-ai-provider-button"
        sx={{
          p: 1,
          borderRadius: 0,
          bgcolor: (t) => {
            if (isProviderActive(provider.value)) {
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
        onClick={async () => {
          if (!isProviderActive(provider.value)) {
            await updateChatGPTProvider(provider.value)
            onProviderChange && onProviderChange()
          }
        }}
      >
        <SearchWIthAIProviderIcon
          aiProviderType={provider.value}
          isActive={isProviderActive(provider.value)}
        />

        {/* <AIProviderIcon
        aiProviderType={provider}
        active={isProviderActive(provider)}
        size={isProviderActive(provider) ? 32 : 24}
      ></AIProviderIcon> */}
      </IconButton>
    )

    if (provider.permission) {
      return (
        <PermissionWrapper
          TooltipProps={{
            placement: 'bottom',
            PopperProps: {
              disablePortal: true,
            },
          }}
          allowedRoles={provider.permission.allowedRoles}
          sceneType={provider.permission.sceneType}
        >
          {providerIcon}
        </PermissionWrapper>
      )
    }

    if (provider.preChangeChecker) {
      return (
        <PreChangeCheckerTooltip {...provider.preChangeChecker}>
          {providerIcon}
        </PreChangeCheckerTooltip>
      )
    }

    return providerIcon
  }

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      sx={{
        borderRadius: 1,
        border: '1px solid',
        borderColor: (t) =>
          t.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.08)',
        width: 'max-content',
        mx: 'auto',
        overflow: 'hidden',

        '& button.search-with-ai-provider-button': {
          borderRight: '1px solid',
          borderColor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.08)',
        },
        '& > span:last-of-type > .search-with-ai-provider-button': {
          borderRight: 'none',
        },

        ...sx,
      }}
    >
      {providerList.map((provider) => {
        return (
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            key={provider.value}
            title={<Typography fontSize={12}>{provider.label}</Typography>}
            placement="top"
          >
            <span>{renderIcon(provider)}</span>
          </Tooltip>
        )
      })}
      <ThirdPartyProvider
        disabled={disabled}
        onProviderChange={onProviderChange}
      />
    </Stack>
  )
}

export const PreChangeCheckerTooltip = (
  props: ISearchWithAIProviderOptionsType['preChangeChecker'] & {
    children: React.ReactNode
  },
) => {
  const [open, setOpen] = useState(false)

  const checkerFn = useCallback(async () => {
    if (props.checker) {
      return await props.checker()
    } else {
      return true
    }
  }, [props.checker])

  return (
    <TextOnlyTooltip
      arrow
      open={open}
      PopperProps={{
        container: getSearchWithAIRootElement(),
        sx: {
          '& > div': {
            bgcolor: (t) => {
              if (t.palette.mode === 'dark') {
                return 'rgba(97, 97, 97, 0.9)'
              } else {
                return '#fff'
              }
            },
            boxShadow: (t) => t.shadows[1],
          },
        },
      }}
      placement="left"
      title={
        <ClickAwayListener
          mouseEvent={'onMouseDown'}
          onClickAway={() => {
            setOpen(false)
          }}
        >
          <Box>{props?.tooltip?.title}</Box>
        </ClickAwayListener>
      }
    >
      <Box>
        {
          React.Children.map(props.children, (child) => {
            // modify child props
            if (React.isValidElement(child)) {
              const newProps = {
                ...child.props,
                ...(child.props.onClick && {
                  onClick: async (event: any, ...args: any[]) => {
                    let isChecked = false
                    event?.stopPropagation?.()
                    event?.preventDefault?.()

                    if (await checkerFn()) {
                      isChecked = true
                    }

                    setOpen(!isChecked)
                    if (isChecked) {
                      child.props?.onClick?.(event, ...args)
                    }
                  },
                }),
              }
              return React.cloneElement(child, newProps)
            }
            return child
          }) as any
        }
      </Box>
    </TextOnlyTooltip>
  )
}

export default AIProviderBar
