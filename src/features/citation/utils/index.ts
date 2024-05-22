import { ICitationNode } from '@/features/citation/types'

export const createNode = (
  parent: ICitationNode | null = null,
): ICitationNode => {
  if (parent) {
    const node = {
      parent,
      children: [],
      index: parent.children.length,
    }
    parent.children.push(node)
    return node
  }
  return {
    parent,
    children: [],
    index: 0
  }
}
