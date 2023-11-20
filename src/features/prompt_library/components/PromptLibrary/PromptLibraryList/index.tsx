import { Grid, Stack } from '@mui/material'
import React, { FC, useCallback, useMemo, useState } from 'react'
import { useRecoilValue } from 'recoil'

import CustomTablePagination from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList/CustomTablePagination'
import EmptyContent from '@/components/select/EmptyContent'
import { PromptCard } from '@/features/prompt/components/PromptCard'
import { usePromptSearch } from '@/features/prompt/hooks/usePromptSearch'
import AddOwnPromptCard from '@/features/prompt/components/AddOwnPromptCard'
import PromptFormModal from '@/features/prompt/components/PromptFormModal'
import { PromptSearchParamsStore } from '@/features/prompt/store'
import { IPromptActionKey, IPromptCardData } from '@/features/prompt/types'
import AppLoadingLayout from '@/layouts/AppLoadingLayout'
import { hasData } from '@/utils/utils'
import useSelectPromptController from '@/features/prompt/hooks/useSelectPromptController'
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

  const [modalType, setModalType] = useState<'add' | 'edit'>('add')
  const [modalDefaultData, setModalDefaultData] = useState<IPromptCardData>()
  const [addModalShow, setAddModalShow] = useState(false)
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
              <PromptCard
                onRefresh={handleRefresh}
                actionButton={actionButton}
                active={selectPromptId === prompt.id}
                prompt={prompt}
                onClick={handlePromptClick}
                onPromptClearSelected={handleClearSelected}
                onOpenEditModal={(prompt) => {
                  updateSelectPromptId(null)
                  setModalDefaultData(prompt)
                  setModalType('edit')
                  // init variables
                  // batchAddVariable(prompt?.variables ?? [], true);
                  setAddModalShow(true)
                }}
              />
            ) : (
              <PromptCard
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
            <AddOwnPromptCard
              onClick={() => {
                updateSelectPromptId(null)
                setModalDefaultData(undefined)
                setModalType('add')
                // initReservedVariable();
                setAddModalShow(true)
              }}
            />
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
      {addModalShow && (
        <PromptFormModal
          dataLength={data.length}
          defaultData={modalDefaultData}
          type={modalType}
          show={addModalShow}
          onClose={() => setAddModalShow(false)}
          onConfirm={() => {
            setAddModalShow(false)
            handleRefresh()
          }}
        />
      )}
    </Stack>
  )
}
export default PromptLibraryList
