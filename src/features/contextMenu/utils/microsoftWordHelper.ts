import { mergeRects } from '@/features/contextMenu/utils/index'

/**
 * 判断是否在office word编辑页面
 * @param url
 */
export const isOfficeWordEditorFrame = (url = window.location.href) =>
  url.includes('word-edit.officeapps.live.com/we/wordeditorframe.aspx')

/**
 * 判断是否在office word下正在编辑
 * @param element
 */
export const isOfficeWordEditing = (element = document.activeElement) =>
  element?.id === 'WACViewPanel_EditingElement'

/**
 * 获取当前编辑元素
 */
export const getOfficeWordEditElement = () =>
  document.querySelector('#WACViewPanel_EditingElement')

/**
 * 获取当前以选中的元素
 */
export const getOfficeWordSelectedElements = () =>
  Array.from(
    document.querySelectorAll(
      [
        // 普通文本选择
        '#PagesContainer .Selected:not(.OnlyImageSelected)',
        // 表格行选择
        '#PagesContainer .TableRowSelectedThemed',
        // 表格单元格选择
        '#PagesContainer .TableCellSelectedThemed',
      ].join(', '),
    ),
  )

/**
 * 获取当前选中元素的rect
 */
export const getOfficeWordSelectionRect = () => {
  const selectedElements = getOfficeWordSelectedElements()
  if (selectedElements.length) {
    return mergeRects(
      selectedElements.map((item) => item.getBoundingClientRect().toJSON()),
    )
  }
  return null
}

/**
 * 模拟点击事件选择office word页面上某个选区
 * @param range
 */
export const selectOfficeWordRange = (range: Range) => {
  const restoreRect = range.getBoundingClientRect()
  const pagesContainer = document.querySelector('#WACViewPanel')
  pagesContainer?.dispatchEvent(
    new MouseEvent('click', {
      bubbles: false,
      clientX: restoreRect.x,
      clientY: restoreRect.y,
    }),
  )
  pagesContainer?.dispatchEvent(
    new MouseEvent('mousedown', {
      bubbles: false,
      clientX: restoreRect.x,
      clientY: restoreRect.y,
    }),
  )
  pagesContainer?.dispatchEvent(
    new MouseEvent('mouseup', {
      bubbles: false,
      clientX: restoreRect.x + restoreRect.width,
      clientY: restoreRect.y + restoreRect.height,
    }),
  )
}
