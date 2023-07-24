import React, { FC, useState } from 'react'
import {
  IUserCurrentPlan,
  useUserInfo,
} from '@/features/auth/hooks/useUserInfo'
import { IUserRoleType } from '@/features/auth/types'
import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'
import Box, { BoxProps } from '@mui/material/Box'
import { ClickAwayListener } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type PermissionWrapperCardSceneType = 'PROMPT'
type PermissionWrapperCardType = {
  title: React.ReactNode
  description: React.ReactNode
}

interface PermissionWrapperProps {
  sceneType: PermissionWrapperCardSceneType
  permissions: IUserRoleType[]
  onPermission?: (currentPlan: IUserCurrentPlan) => Promise<boolean>
  children: React.ReactNode
  TooltipProps?: Omit<TextOnlyTooltipProps, 'title'>
  BoxProps?: BoxProps
}

export const PERMISSION_CARD_SETTINGS_TEMPLATE: {
  [key in PermissionWrapperCardSceneType]: PermissionWrapperCardType
} = {
  PROMPT: {
    title: 'Upgrade to add new prompt',
    description:
      'New prompts can now be added with the upgraded version.  Upgrade now to unlock the potential of adding new prompts while maintaining a controlled environment within your workspace.',
  },
}

const PermissionWrapper: FC<PermissionWrapperProps> = (props) => {
  const {
    sceneType = 'PROMPT',
    permissions,
    onPermission,
    BoxProps,
    TooltipProps,
    children,
  } = props
  const { title, description } = PERMISSION_CARD_SETTINGS_TEMPLATE[sceneType]
  const { currentUserPlan } = useUserInfo()
  const [open, setOpen] = useState(false)
  if (permissions.find((permission) => permission === currentUserPlan.name)) {
    return <>{children}</>
  }
  return (
    <TextOnlyTooltip
      arrow
      open={open}
      sx={{
        '& > div': {
          p: 1,
        },
      }}
      title={
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Stack spacing={1}>
            <Typography
              fontSize={'14px'}
              fontWeight={600}
              textAlign={'left'}
              color={'text.primary'}
            >
              {title}
            </Typography>
            <Typography
              fontSize={'12px'}
              fontWeight={400}
              textAlign={'left'}
              color={'text.primary'}
            >
              {description}
            </Typography>
          </Stack>
        </ClickAwayListener>
      }
      {...TooltipProps}
    >
      <Box {...BoxProps}>
        <Box>
          {
            React.Children.map(children, (child) => {
              // modify child props
              if (React.isValidElement(child)) {
                const newProps = {
                  ...child.props,
                  onClick: async (event: any) => {
                    let isAuth = false
                    if (onPermission) {
                      isAuth = await onPermission(currentUserPlan)
                    }
                    setOpen(!isAuth)
                    if (isAuth) {
                      child.props?.onClick?.(event)
                    } else {
                      event?.stopPropagation?.()
                      event?.preventDefault?.()
                    }
                  },
                }
                return React.cloneElement(child, newProps)
              }
              return child
            }) as any
          }
        </Box>
      </Box>
    </TextOnlyTooltip>
  )
}
export default PermissionWrapper
