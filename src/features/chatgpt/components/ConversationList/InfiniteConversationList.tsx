import memoize from 'memoize-one'
import React, { useCallback } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import InfiniteFixedSizeLoader from 'react-window-infinite-loader'

import { IPaginationConversation } from '@/features/indexed_db/conversations/models/Conversation'

import ConversationRow from './ConversationRow'

export interface IInfiniteConversationListProps {
  hasNextPage: boolean
  isNextPageLoading: boolean
  loadNextPage: () => void
  conversations: IPaginationConversation[]
  onSelectItem?: (conversation: IPaginationConversation) => void
}

const createConversationListData = memoize(
  (
    items: IPaginationConversation[],
    onSelectItem?: (conversation?: IPaginationConversation) => void,
    isNextPageLoading?: boolean,
  ) => ({
    items,
    onSelectItem,
    isNextPageLoading,
  }),
)

const InfiniteConversationList: (
  props: IInfiniteConversationListProps,
) => JSX.Element = (props) => {
  const {
    hasNextPage,
    isNextPageLoading,
    loadNextPage,
    conversations,
    onSelectItem,
  } = props
  const itemCount = hasNextPage
    ? conversations.length + 1
    : conversations.length
  const loadMoreItems = async () => {
    if (isNextPageLoading) {
      return
    }
    loadNextPage()
  }
  const isItemLoaded = (index: number) => {
    return !hasNextPage || index < conversations.length
  }
  const handleSelectItemOrLoadMore = useCallback(
    (conversation?: IPaginationConversation) => {
      if (conversation) {
        onSelectItem?.(conversation)
      } else {
        loadMoreItems()
      }
    },
    [loadMoreItems, onSelectItem],
  )

  const itemData = createConversationListData(
    conversations,
    handleSelectItemOrLoadMore,
    isNextPageLoading,
  )
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
              itemData={itemData}
              itemSize={60}
              itemCount={itemCount}
              onItemsRendered={onItemsRendered}
              ref={ref}
              className={'maxai--conversation-list'}
              {...props}
            >
              {(rowProps) => <ConversationRow {...rowProps} />}
            </FixedSizeList>
          )}
        </AutoSizer>
      )}
    </InfiniteFixedSizeLoader>
  )
}

export default InfiniteConversationList
