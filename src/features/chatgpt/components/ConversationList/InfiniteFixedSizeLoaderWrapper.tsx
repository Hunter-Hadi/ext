import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import InfiniteFixedSizeLoader from 'react-window-infinite-loader'

export interface IInfiniteFixedSizeLoaderWrapperProps<T> {
  hasNextPage: boolean
  isNextPageLoading: boolean
  loadNextPage: () => void
  items: T[]
  renderItem: (props: { index: number; style: any }, item: T) => React.ReactNode
  itemSize?: number
}

const InfiniteFixedSizeLoaderWrapper: <T>(
  props: IInfiniteFixedSizeLoaderWrapperProps<T>,
) => JSX.Element = (props) => {
  const {
    hasNextPage,
    isNextPageLoading,
    loadNextPage,
    items,
    renderItem,
    itemSize,
  } = props
  const itemCount = hasNextPage ? items.length + 1 : items.length
  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage
  const isItemLoaded = (index: number) => !hasNextPage || index < items.length
  const Item = ({ index, style }: { index: number; style: any }) => {
    if (!isItemLoaded(index)) {
      return (
        <Stack
          style={style}
          width={'100%'}
          alignItems={'center'}
          justifyContent={'center'}
          sx={{
            my: '16px',
          }}
        >
          <CircularProgress size={16} sx={{ m: '0 auto' }} />
        </Stack>
      )
    }
    return renderItem({ index, style }, items[index]) as JSX.Element
  }
  return (
    <InfiniteFixedSizeLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <FixedSizeList
              height={height}
              width={width}
              style={{
                flex: 1,
              }}
              itemSize={itemSize || 60}
              itemCount={itemCount}
              onItemsRendered={onItemsRendered}
              ref={ref}
              {...props}
            >
              {Item}
            </FixedSizeList>
          )}
        </AutoSizer>
      )}
    </InfiniteFixedSizeLoader>
  )
}

export default InfiniteFixedSizeLoaderWrapper
