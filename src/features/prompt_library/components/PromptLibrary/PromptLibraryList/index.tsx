import { Grid, Stack } from '@mui/material'
import React, { FC, useContext, useEffect, useMemo } from 'react'

import { webPageRunMaxAIShortcuts } from '@/features/common/utils/postMessageToCRX'
import PromptLibraryCard from '@/features/prompt_library/components/PromptLibrary/PromptLibraryCard'
import PromptLibraryCardSkeleton from '@/features/prompt_library/components/PromptLibrary/PromptLibraryCard/PromptLibraryCardSkeleton'
import PromptLibraryPagination from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/PrompLibraryPagination'
import AddOwnPromptCard from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList/AddOwnPromptCard'
import usePromptLibraryBreakpoint from '@/features/prompt_library/hooks/usePromptLibraryBreakpoint'
import usePromptLibraryList from '@/features/prompt_library/hooks/usePromptLibraryList'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import { PromptLibraryRuntimeContext } from '@/features/prompt_library/store'
import {
  IPromptActionKey,
  IPromptLibraryCardData,
} from '@/features/prompt_library/types'
import { promptLibraryCardDetailDataToActions } from '@/features/shortcuts/utils/promptInterpreter'

const PromptLibraryList: FC<{
  onClick?: (promptLibraryCard?: IPromptLibraryCardData) => void
}> = (props) => {
  const { onClick } = props
  const { promptLibraryRuntime } = useContext(PromptLibraryRuntimeContext)!
  const { data, isLoading, isFetching } = usePromptLibraryList()
  const {
    activeTab,
    promptLibraryListParameters,
  } = usePromptLibraryParameters()
  const currentBreakpoint = usePromptLibraryBreakpoint()
  const itemWidth = useMemo(() => {
    if (currentBreakpoint === 'xs') {
      return 12
    } else if (currentBreakpoint === 'sm') {
      return 6
    } else if (currentBreakpoint === 'md') {
      return 4
    } else if (currentBreakpoint === 'lg' || currentBreakpoint === 'xl') {
      return 3
    }
    return 6
  }, [currentBreakpoint])
  const actionButton = useMemo<IPromptActionKey[]>(() => {
    if (activeTab === 'Own') {
      return ['see', 'delete', 'edit', 'favorite']
    }
    if (activeTab === 'Favorites') {
      return ['see', 'favorite']
    }
    return ['see', 'favorite']
  }, [activeTab])
  useEffect(() => {}, [promptLibraryRuntime])
  const CardList = useMemo(() => {
    // 因为在 WebPage 中，没有line progress
    if (isLoading || (promptLibraryRuntime === 'WebPage' && isFetching)) {
      return new Array(promptLibraryListParameters.page_size)
        .fill(1)
        .map((_, index) => {
          return (
            <Grid key={index} item xs={itemWidth}>
              <PromptLibraryCardSkeleton actionKeys={actionButton} />
            </Grid>
          )
        })
    }
    if (!data) {
      return null
    }
    return (
      <>
        {data.map((prompt) => (
          <Grid key={prompt.id} item xs={itemWidth}>
            <PromptLibraryCard
              actionButton={actionButton}
              prompt={prompt}
              onClick={(promptData) => {
                if (promptData && promptLibraryRuntime === 'WebPage') {
                  webPageRunMaxAIShortcuts(
                    promptLibraryCardDetailDataToActions(promptData),
                  )
                }
                if (onClick) {
                  onClick(promptData)
                }
              }}
            />
          </Grid>
        ))}
      </>
    )
  }, [
    promptLibraryRuntime,
    isFetching,
    isLoading,
    data,
    activeTab,
    actionButton,
    promptLibraryListParameters.page_size,
    onClick,
    itemWidth,
  ])
  return (
    <Stack
      spacing={0}
      mb={0}
      height={0}
      flex={1}
      width={'100%'}
      sx={{
        overflowY: 'auto',
      }}
    >
      <Grid container spacing={2}>
        {activeTab === 'Own' && (
          <Grid item xs={itemWidth}>
            <AddOwnPromptCard />
          </Grid>
        )}
        {CardList}
        <Grid item xs={12}>
          <PromptLibraryPagination />
        </Grid>
      </Grid>
    </Stack>
  )
}
export default PromptLibraryList
