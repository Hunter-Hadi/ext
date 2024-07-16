import { SxProps } from '@mui/material/styles'

//
// - "text/plain": Plain text content (extension: txt)
// - "text/markdown": Markdown content (extension: md)
// - "text/html": HTML/CSS/JavaScript content (extension: html)
// - "image/svg+xml": SVG image content (extension: svg)
// - "application/vnd.ant.code": Code content (extension varies based on language)
// - "application/vnd.ant.mermaid": Mermaid diagram content (extension: mermaid)
// - "application/vnd.ant.react": React component content (extension: tsx)

export enum ArtifactsType {
  TEXT = 'text/plain',
  MARKDOWN = 'text/markdown',
  HTML = 'text/html',
  SVG = 'image/svg+xml',
  CODE = 'application/vnd.ant.code',
  MERMAID = 'application/vnd.ant.mermaid',
  REACT = 'application/vnd.ant.react',
}

export interface IArtifacts {
  identifier: string
  type: ArtifactsType
  title: string
  content: string
  complete: boolean
}

export interface IArtifactsPreviewRef {
  reload: () => void
}

export interface IArtifactsPreviewProps {
  artifacts: IArtifacts
  sx?: SxProps
}

export {}
