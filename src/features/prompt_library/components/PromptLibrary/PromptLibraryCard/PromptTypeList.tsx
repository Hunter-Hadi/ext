import { Theme, Typography } from '@mui/material'
import React, { FC, useMemo } from 'react'

import {
  IPromptLibraryCardDetailVariable,
  IPromptLibraryCardDetailVariableType,
} from '@/features/prompt_library/types'
import { isLiveCrawling } from '@/features/prompt_library/utils'

interface IProps {
  typeList?: IPromptLibraryCardDetailVariableType[]
  variables?: IPromptLibraryCardDetailVariable[]
}

const variableTypesNameMap: {
  [key in IPromptLibraryCardDetailVariableType]?: string
} = {
  websearch: 'Web Search',
  livecrawling: 'Live Crawling',
}

const variableTypesSxMap: {
  [key in IPromptLibraryCardDetailVariableType]?: any
} = {
  websearch: {
    bgcolor: (t: Theme) =>
      t.palette.mode === 'dark'
        ? 'rgba(178, 115, 255, 0.16)'
        : 'rgba(118, 1, 211, 0.08)',
    color: 'primary.main',
  },
  livecrawling: {
    bgcolor: (t: Theme) =>
      t.palette.mode === 'dark'
        ? 'rgba(178, 115, 255, 0.16)'
        : 'rgba(118, 1, 211, 0.08)',
    color: 'primary.main',
  },
}

const PromptTypeList: FC<IProps> = ({ typeList, variables }) => {
  const filterTypeList = useMemo<(keyof typeof variableTypesNameMap)[]>(() => {
    if (typeList) {
      return typeList?.filter((type) => variableTypesNameMap[type]) || []
    } else {
      // 兼容线上接口没有 variable_types 的情况
      const isLiveCrawlingFlag = isLiveCrawling(variables)
      return isLiveCrawlingFlag ? ['livecrawling'] : []
    }
  }, [typeList, variables])

  return (
    <>
      {filterTypeList.map((type) => {
        return (
          <Typography
            key={type}
            variant={'custom'}
            component={'span'}
            sx={(t) => {
              const isDark = t.palette.mode === 'dark'
              return {
                fontSize: 14,
                color: 'primary.main',
                bgcolor: isDark
                  ? 'rgba(178, 115, 255, 0.16)'
                  : 'rgba(118, 1, 211, 0.08)',
                px: 0.5,
                // py: '2px',
                mr: 1,
                borderRadius: 1,

                ...variableTypesSxMap[type],
              }
            }}
          >
            {variableTypesNameMap[type]}
          </Typography>
        )
      })}
    </>
  )
}

export default PromptTypeList
