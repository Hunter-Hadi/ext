import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'

import { IPromptActionKey } from '@/features/prompt_library/types'

const PromptLibraryCardSkeleton: FC<{
  actionKeys: IPromptActionKey[]
}> = (props) => {
  const { actionKeys } = props
  return (
    <Stack
      p={2}
      spacing={1.5}
      onClick={() => {}}
      sx={(t) => {
        const isDark = t.palette.mode === 'dark'
        const normalBgcolor = isDark ? '#3E3F4C' : '#fff'
        const shadowColor = isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.16)'

        return {
          position: 'relative',
          color: 'text.primary',
          border: '1px solid',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'all 0.2s ease-in-out',
          height: 'calc(100% - 16px - 16px)',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.08)',
          bgcolor: normalBgcolor,
          '&:hover': {
            boxShadow: `0px 4px 8px ${shadowColor}`,
          },
        }
      }}
    >
      <Stack direction="row" spacing={1.5} justifyContent="space-between">
        <Skeleton
          variant={'rectangular'}
          width={0}
          height={72}
          sx={{
            borderRadius: '4px',
            flex: 1,
          }}
        />
        <Stack direction="row" fontSize={16} height="max-content" spacing={0.5}>
          {actionKeys.map((action) => {
            return (
              <Skeleton
                variant={'rounded'}
                width={24}
                height={24}
                key={action}
              />
            )
          })}
        </Stack>
      </Stack>
      <Skeleton
        variant={'rectangular'}
        width={'60%'}
        height={20}
        sx={{
          borderRadius: '4px',
        }}
      />
      <Skeleton
        variant={'rectangular'}
        width={'33.3%'}
        height={20}
        sx={{
          borderRadius: '4px',
        }}
      />
      <Stack gap={0.5}>
        <Skeleton
          variant={'rectangular'}
          width={'100%'}
          height={17.33}
          sx={{
            borderRadius: '4px',
          }}
        />
        <Skeleton
          variant={'rectangular'}
          width={'100%'}
          height={17.33}
          sx={{
            borderRadius: '4px',
          }}
        />
        <Skeleton
          variant={'rectangular'}
          width={'100%'}
          height={17.33}
          sx={{
            borderRadius: '4px',
          }}
        />
      </Stack>
    </Stack>
  )
}
export default PromptLibraryCardSkeleton
