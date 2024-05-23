import memoize from 'memoize-one'
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import {
  areEqual,
  ListChildComponentProps,
  ListOnScrollProps,
  VariableSizeList as List,
} from 'react-window'

import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import SidebarChatBoxMessageItem from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageItem'

export interface ISidebarMessagesListProps {
  messages: IChatMessage[]
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

const createItemData = memoize(
  (
    messages: IChatMessage[],
    onUpdateHeight: (index: number, height: number) => void,
  ) => {
    return {
      messages,
      onUpdateHeight,
    }
  },
)

const SidebarMessagesListWrapper: FC<ISidebarMessagesListProps> = ({
  messages,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}) => {
  const listRef = useRef<List>(null)
  const [itemSizes, setItemSizes] = useState<{ [index: number]: number }>({})

  const handleScroll = useCallback(
    (props: ListOnScrollProps) => {
      const { scrollDirection, scrollOffset, scrollUpdateWasRequested } = props
      // scrollUpdateWasRequested是一个boolean值，表示是否是由于调用了scrollTo方法导致的滚动
      if (scrollUpdateWasRequested) {
        return
      }
      // 向上滚动 && 没有在加载下一页 && 还有下一页 && scrollOffset为0+buffer
      if (
        scrollDirection === 'backward' &&
        !isFetchingNextPage &&
        hasNextPage &&
        scrollOffset <= 40
      ) {
        debugger
        fetchNextPage()
      }
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  )

  const itemSize = useCallback(
    (index: number) => itemSizes[index] || 60,
    [itemSizes],
  )

  const itemCount = messages.length

  const itemKey = useCallback(
    (index: number, data: IChatMessage) => data.messageId,
    [],
  )

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(messages.length - 1, 'end')
    }
  }, [messages.length])

  const handleUpdateHeight = useCallback((index: number, height: number) => {
    setItemSizes((prev) => {
      const prevHeight = prev[index]
      if (prevHeight) {
        // 如果高度变化不大，不更新
        if (Math.abs(prevHeight - height) <= 10) {
          console.log(
            `handleUpdateHeight [${index}] [不更新]`,
            Math.abs(prevHeight - height),
            'skip',
          )
          return prev
        }
      }
      console.log(`handleUpdateHeight [${index}] [更新]`, height)
      return { ...prev, [index]: height }
    })
    listRef.current?.resetAfterIndex(index)
  }, [])
  const itemData = createItemData(messages, handleUpdateHeight)

  console.log('AutoSizer render list', messages.length, messages)
  return (
    <AutoSizer>
      {({ width, height }: { width: number; height: number }) => (
        <List
          ref={listRef}
          width={width}
          height={height}
          itemCount={itemCount}
          itemSize={itemSize}
          itemKey={itemKey}
          itemData={itemData}
          onScroll={handleScroll}
          overscanCount={0}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  )
}
const Row = memo(
  function RowRender({ index, style, data }: ListChildComponentProps) {
    const { onUpdateHeight, messages } = data
    const message = messages[index]
    if (message.messageId === 'c83a86c8-f3d3-4aff-b024-2836e7c0bd24') {
      console.log(`handleUpdateHeight, index: ${index}, message: `, message)
    }
    return (
      <div style={style}>
        <SidebarChatBoxMessageItem
          order={index}
          message={message}
          onChangeHeight={
            onUpdateHeight
              ? (height) => onUpdateHeight(index, height)
              : undefined
          }
        />
      </div>
    )
  },
  (prevProps, nextProps) => {
    const prev = prevProps.data.messages[prevProps.index]
    const next = nextProps.data.messages[nextProps.index]
    const changes = deepDiff(prev, next)
    if (next.messageId === 'c83a86c8-f3d3-4aff-b024-2836e7c0bd24') {
      console.log(
        `[next] handleUpdateHeight`,
        nextProps.index,
        changes,
        areEqual(prevProps, nextProps),
      )
    }
    return areEqual(prevProps, nextProps)
  },
)
import entries from 'lodash-es/entries'
import get from 'lodash-es/get'
import has from 'lodash-es/has'
import isArray from 'lodash-es/isArray'
import isEqual from 'lodash-es/isEqual'
import isObject from 'lodash-es/isObject'
import isObjectLike from 'lodash-es/isObjectLike'
import isUndefined from 'lodash-es/isUndefined'
import keys from 'lodash-es/keys'

type AnyObject = Record<string, any>

interface DiffResult {
  [key: string]:
    | {
        __old?: any
        __new?: any
        from?: any
        to?: any
      }
    | DiffResult
}

/**
 * Deep diff between two object-likes
 * @param  {AnyObject} fromObject the original object
 * @param  {AnyObject} toObject   the updated object
 * @return {DiffResult}           a new object which represents the diff
 */
export function deepDiff(
  fromObject: AnyObject,
  toObject: AnyObject,
): DiffResult {
  const changes: DiffResult = {}

  const buildPath = (
    path: DiffResult | undefined,
    obj: AnyObject,
    key: string,
  ): [DiffResult, string] => {
    const origVal = get(obj, key)
    if (isUndefined(path)) {
      if (isArray(origVal)) {
        changes[key] = []
      } else if (isObject(origVal)) {
        changes[key] = {}
      }
    } else {
      if (isArray(origVal)) {
        path[key] = []
      } else if (isObject(origVal)) {
        path[key] = {}
      }
    }
    return [isUndefined(path) ? changes : path, key]
  }

  const walk = (
    fromObj: AnyObject,
    toObj: AnyObject,
    path?: DiffResult,
  ): void => {
    for (const key of keys(fromObj)) {
      const objKeyPair = buildPath(path, fromObj, key)
      if (!has(toObj, key)) {
        objKeyPair[0][objKeyPair[1]] = { from: get(fromObj, key) }
      }
    }

    for (const [key, to] of entries(toObj)) {
      const isLast = has(fromObj, key)
      const objKeyPair = buildPath(path, fromObj, key)
      if (isLast) {
        const from = get(fromObj, key)
        if (!isEqual(from, to)) {
          if (isObjectLike(to) && isObjectLike(from)) {
            walk(from, to, objKeyPair[0][objKeyPair[1]] as DiffResult)
          } else {
            objKeyPair[0][objKeyPair[1]] = { __old: from, __new: to }
          }
        } else {
          delete objKeyPair[0][objKeyPair[1]]
        }
      } else {
        objKeyPair[0][objKeyPair[1]] = { to }
      }
    }
  }

  walk(fromObject, toObject)

  return changes
}

export default SidebarMessagesListWrapper
