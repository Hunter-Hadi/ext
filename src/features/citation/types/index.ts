import { IRangyRect } from '@/features/contextMenu/types'

export interface ICitationService {
  loading: boolean

  // findText(content: string): Promise<[] | [ICitationMatch, ICitationMatch]>
  findText(content: string, startIndex: number): Promise<string>
}

export interface ICitationMatch {
  // 对于窗口的位置
  rect?: IRangyRect
  // 对于container的位置
  layout?: Exclude<IRangyRect, 'x' | 'y'>
  // 文字内容
  text: string
  // 节点容器
  container: string | HTMLElement | null | (() => HTMLElement | null)
  // 文字节点
  textNode?: Node | null
  // 文字位置
  offset: number
}

export interface ICitationNode {
  parent: ICitationNode | null
  children: ICitationNode[]
  index: number
}
