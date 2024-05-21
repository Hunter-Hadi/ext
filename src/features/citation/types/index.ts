import { IRangyRect } from '@/features/contextMenu/types'

export interface ICitationService {
  // findText(content: string): Promise<ICitationMatch[]>
  findText(content: string): Promise<string>
}

export interface ICitationMatch {
  // 对于窗口的位置
  rect: IRangyRect
  // 对于container的位置
  layout: Exclude<IRangyRect, 'x' | 'y'>
  // 文字内容
  text: string
  // 节点容器
  container: string | HTMLElement | (() => HTMLElement)
}
