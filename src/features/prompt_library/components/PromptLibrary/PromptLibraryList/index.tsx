import { Grid, Stack } from '@mui/material'
import React, { FC, useMemo } from 'react'
import usePromptLibraryList from '@/features/prompt_library/hooks/usePromptLibraryList'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import { IPromptActionKey } from '@/features/prompt_library/types'
import PromptLibraryCard from '@/features/prompt_library/components/PromptLibrary/PromptLibraryCard'
import PromptLibraryCardSkeleton from '@/features/prompt_library/components/PromptLibrary/PromptLibraryCard/PromptLibraryCardSkeleton'
import PromptLibraryPagination from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/PrompLibraryPagination'
import AddOwnPromptCard from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList/AddOwnPromptCard'

const PromptLibraryList: FC = () => {
  const { data, isLoading } = usePromptLibraryList()
  const {
    activeTab,
    promptLibraryListParameters,
  } = usePromptLibraryParameters()
  const actionButton = useMemo<IPromptActionKey[]>(() => {
    if (activeTab === 'Own') {
      return ['see', 'delete', 'edit', 'favorite']
    }
    if (activeTab === 'Favorites') {
      return ['see', 'favorite']
    }
    return ['see', 'favorite']
  }, [activeTab])

  const CardList = useMemo(() => {
    if (isLoading) {
      return new Array(promptLibraryListParameters.page_size)
        .fill(1)
        .map((_, index) => {
          return (
            <Grid key={index} item xs={12} md={6} xl={3}>
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
          <Grid key={prompt.id} item xs={12} md={6} xl={3}>
            <PromptLibraryCard
              onRefresh={() => {}}
              actionButton={actionButton}
              active={false}
              onPromptClearSelected={() => {}}
              prompt={prompt}
              onClick={() => {}}
            />
          </Grid>
        ))}
      </>
    )
  }, [
    isLoading,
    data,
    activeTab,
    actionButton,
    promptLibraryListParameters.page_size,
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
        {CardList}
        {activeTab === 'Own' && (
          <Grid item xs={12} md={6} xl={3}>
            <AddOwnPromptCard />
          </Grid>
        )}
        <Grid item xs={12}>
          <PromptLibraryPagination />
        </Grid>
      </Grid>
    </Stack>
  )
}
export default PromptLibraryList
