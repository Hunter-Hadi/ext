import { Grid, Stack } from '@mui/material'
import React, { FC, useCallback, useMemo } from 'react'
import { useRecoilValue } from 'recoil'

import CustomTablePagination from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList/CustomTablePagination'
import EmptyContent from '@/components/select/EmptyContent'
import PromptLibraryCard from '@/features/prompt_library/components/PromptLibrary/PromptLibraryCard'
import usePromptSearch from '@/features/prompt_library/hooks/usePromptSearch'
import AddOwnPromptCard from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList/AddOwnPromptCard'
import { PromptSearchParamsStore } from '@/features/prompt_library/store'
import {
  IPromptActionKey,
  IPromptCardData,
} from '@/features/prompt_library/types'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import { hasData } from '@/utils'
import useSelectPromptController from '@/features/prompt_library/hooks/useSelectPromptController'
// import PermissionWrapper from '@/features/auth/components/PermissionWrapper'
// import { FREE_PLAN_LIMIT_OWN_COUNT } from '@/features/auth/constant'

const PromptLibraryList: FC = () => {
  const {
    data,
    isFetching,
    current,
    total,
    pageSize,
    loaded,
    setCurrent,
    setPageSize,
    refetch,
  } = usePromptSearch()

  const searchParamsStore = useRecoilValue(PromptSearchParamsStore)
  const tabActive = searchParamsStore.tab_active

  const { selectPromptId, updateSelectPromptId } = useSelectPromptController()

  const handlePromptClick = (prompt: IPromptCardData) => {
    if (selectPromptId === prompt.id) {
      updateSelectPromptId(null)
    } else {
      updateSelectPromptId(prompt.id, prompt.type)
    }
  }

  const handleClearSelected = () => {
    updateSelectPromptId(null)
  }

  const handlePageChange = useCallback((e: any, value: number) => {
    setCurrent(value)
  }, [])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
  }, [])

  const handleRefresh = () => {
    updateSelectPromptId(null)
    refetch()
  }

  const paginationProps = useMemo(
    () => ({
      labelRowsPerPage: 'Prompts per page:',
      rowsPerPageOptions: [8, 12, 16, 20],
    }),
    [],
  )

  const actionButton = useMemo<IPromptActionKey[]>(() => {
    if (tabActive === 'Own') {
      return ['see', 'delete', 'edit', 'favorite']
    }
    if (tabActive === 'Favorites') {
      return ['see', 'favorite']
    }
    // if(tabActive === 'Public') {
    return ['see', 'favorite']
    // }
  }, [tabActive])

  const CardList = useMemo(() => {
    if (!hasData(data) && tabActive !== 'Own') {
      return (
        <Grid item xs={12}>
          <EmptyContent sx={{ py: 4 }} />
        </Grid>
      )
    }

    return (
      <>
        {data.map((prompt) => (
          <Grid key={prompt.id} item xs={12} md={6} xl={3}>
            {tabActive === 'Own' ? (
              <PromptLibraryCard
                onRefresh={handleRefresh}
                actionButton={actionButton}
                active={selectPromptId === prompt.id}
                prompt={prompt}
                onClick={handlePromptClick}
                onPromptClearSelected={handleClearSelected}
                onOpenEditModal={(prompt) => {
                  updateSelectPromptId(null)
                }}
              />
            ) : (
              <PromptLibraryCard
                onRefresh={handleRefresh}
                actionButton={actionButton}
                active={selectPromptId === prompt.id}
                onPromptClearSelected={handleClearSelected}
                prompt={prompt}
                onClick={handlePromptClick}
              />
            )}
          </Grid>
        ))}
        {tabActive === 'Own' && (
          <Grid item xs={12} md={6} xl={3}>
            <AddOwnPromptCard onClick={() => {}} />
          </Grid>
        )}
      </>
    )
  }, [data, tabActive, actionButton, selectPromptId])

  return (
    <Stack spacing={0} mb={0}>
      {tabActive === 'Public' && (
        <CustomTablePagination
          total={total}
          current={current}
          pageSize={pageSize}
          sx={{ justifyContent: 'flex-end', pt: 0 }}
          paginationProps={paginationProps}
          onChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
      <AppLoadingLayout loading={!loaded || isFetching}>
        <Grid container spacing={2}>
          {CardList}
        </Grid>
      </AppLoadingLayout>
      {tabActive === 'Public' && (
        <CustomTablePagination
          total={total}
          current={current}
          pageSize={pageSize}
          sx={{ justifyContent: 'flex-end', pt: 0 }}
          paginationProps={paginationProps}
          onChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </Stack>
  )
}
export default PromptLibraryList
