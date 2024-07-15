import isArray from 'lodash-es/isArray'
import { visit } from 'unist-util-visit'

const rehypeMaxAIMarkdownCodeRendererPlugin = () => {
  return (tree: any) => {
    visit(tree, 'element', (node) => {
      const { tagName, properties } = node
      if (tagName === 'code') {
        const classNames: string[] = isArray(properties.className)
          ? properties.className
          : [properties.className]
        const maxAICustomMarkdownComponentName = (
          (tagName === 'code' &&
            classNames.find((name) => name.startsWith('language-maxai'))) ||
          ''
        ).replace('language-maxai__', '')
        const isMaxAICustomMarkdownComponent =
          maxAICustomMarkdownComponentName !== ''
        if (isMaxAICustomMarkdownComponent) {
          let isLastNode = false
          try {
            if (node.position.end.offset === tree.position.end.offset) {
              isLastNode = true
            }
          } catch (e) {
            console.error(`Error in rehypeHtmlToReactPlugin`, e)
          }
          node.properties.isMaxAICustomMarkdownComponent =
            isMaxAICustomMarkdownComponent
          node.properties.isLastNode = isLastNode
          node.properties.maxAICustomMarkdownComponentName =
            maxAICustomMarkdownComponentName
        }
      }
    })
  }
}
export default rehypeMaxAIMarkdownCodeRendererPlugin
