import { useRecoilState } from 'recoil'

import {
  ArtifactsType,
  IArtifacts,
} from '@/features/chatgpt/components/artifacts'
import { reloadArtifactsPreview } from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/ArtifactsPreview/useReloadArtifactsPreview'
import {
  ArtifactsFloatingWindowState,
  ArtifactsState,
} from '@/features/chatgpt/components/artifacts/store/ArtifactsState'

export const useArtifacts = () => {
  const [artifacts, setArtifacts] = useRecoilState(ArtifactsState)
  const [floatingWindow, setFloatingWindow] = useRecoilState(
    ArtifactsFloatingWindowState,
  )
  const updateArtifacts = (newArtifacts: Partial<IArtifacts>) => {
    console.log('updateArtifacts', newArtifacts)
    setArtifacts((prev) => ({
      ...prev,
      ...newArtifacts,
    }))
  }

  const showArtifacts = (mode?: 'preview' | 'code') => {
    setFloatingWindow((prev) => {
      return {
        open: true,
        mode: mode || prev.mode,
      }
    })
  }
  const hideArtifacts = () => {
    setFloatingWindow((prev) => {
      return {
        open: false,
        mode: prev.mode,
      }
    })
  }
  const setMode = (mode: 'preview' | 'code') => {
    setFloatingWindow((prev) => {
      return {
        open: prev.open,
        mode,
      }
    })
  }
  const clearArtifacts = () => {
    setArtifacts({
      identifier: '',
      type: ArtifactsType.TEXT,
      title: '',
      content: '',
      complete: true,
    })
    hideArtifacts()
  }

  const downloadArtifacts = () => {
    if (!artifacts.content) {
      return
    }
    const downloadFile = (
      content: string,
      filename: string,
      fileType: string,
    ) => {
      const blob = new Blob([content], { type: fileType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
    switch (artifacts.type) {
      case ArtifactsType.HTML:
        downloadFile(artifacts.content, `${artifacts.title}.html`, 'text/html')
        break
      case ArtifactsType.CODE:
        {
          let fileExtension = 'txt'
          let fileType = 'text/plain'
          if (artifacts.language) {
            switch (artifacts.language) {
              case 'html':
                fileExtension = 'html'
                fileType = 'text/html'
                break
              case 'css':
                fileExtension = 'css'
                break
              case 'json':
                fileExtension = 'json'
                break
              case 'yaml':
                fileExtension = 'yaml'
                break
              case 'xml':
                fileExtension = 'xml'
                break
              case 'markdown':
                fileExtension = 'md'
                break
              case 'javascript':
                fileExtension = 'js'
                break
              case 'typescript':
                fileExtension = 'ts'
                break
              case 'python':
                fileExtension = 'py'
                break
              case 'java':
                fileExtension = 'java'
                break
              case 'csharp':
                fileExtension = 'cs'
                break
              case 'go':
                fileExtension = 'go'
                break
              case 'ruby':
                fileExtension = 'rb'
                break
              case 'rust':
                fileExtension = 'rs'
                break
              case 'php':
                fileExtension = 'php'
                break
              case 'perl':
                fileExtension = 'pl'
                break
              case 'shell':
                fileExtension = 'sh'
                break
              case 'sql':
                fileExtension = 'sql'
                break
              case 'swift':
                fileExtension = 'swift'
                break
              case 'kotlin':
                fileExtension = 'kt'
                break
              case 'dart':
                fileExtension = 'dart'
                break
              case 'scala':
                fileExtension = 'scala'
                break
              case 'r':
                fileExtension = 'r'
                break
              case 'lua':
                fileExtension = 'lua'
                break
              case 'perl6':
                fileExtension = 'p6'
                break
              case 'clojure':
                fileExtension = 'clj'
                break
              case 'elixir':
                fileExtension = 'ex'
                break
              case 'haskell':
                fileExtension = 'hs'
                break
              case 'lisp':
                fileExtension = 'lisp'
                break
              case 'ocaml':
                fileExtension = 'ml'
                break
              case 'pascal':
                fileExtension = 'pas'
                break
              case 'racket':
                fileExtension = 'rkt'
                break
              case 'scheme':
                fileExtension = 'scm'
                break
              case 'smalltalk':
                fileExtension = 'st'
                break
              case 'tcl':
                fileExtension = 'tcl'
                break
              case 'vb':
                fileExtension = 'vb'
                break
              case 'vbscript':
                fileExtension = 'vbs'
                break
              case 'julia':
                fileExtension = 'jl'
                break
              case 'erlang':
                fileExtension = 'erl'
                break
              case 'fsharp':
                fileExtension = 'fs'
                break
              case 'forth':
                fileExtension = 'fs'
                break
              case 'fortran':
                fileExtension = 'f90'
                break
              case 'apex':
                fileExtension = 'cls'
                break
              case 'powershell':
                fileExtension = 'ps1'
                break
              case 'plaintext':
                fileExtension = 'txt'
                break
              default:
                fileExtension = 'txt'
                fileType = 'text/plain'
                break
            }
          }
          downloadFile(
            artifacts.content,
            `${artifacts.title}.${fileExtension}`,
            fileType,
          )
        }
        break
      case ArtifactsType.MARKDOWN:
        downloadFile(
          artifacts.content,
          `${artifacts.title}.md`,
          'text/markdown',
        )
        break
      case ArtifactsType.SVG:
        downloadFile(
          artifacts.content,
          `${artifacts.title}.svg`,
          'image/svg+xml',
        )
        break
      case ArtifactsType.MERMAID:
        downloadFile(
          artifacts.content,
          `${artifacts.title}.mermaid`,
          'application/vnd.ant.mermaid',
        )
        break
      case ArtifactsType.REACT:
        downloadFile(
          artifacts.content,
          `${artifacts.title}.${
            artifacts.language === 'typescript' ? 'tsx' : 'jsx'
          }`,
          'application/vnd.ant.react',
        )
        break
      case ArtifactsType.TEXT:
      default:
        downloadFile(artifacts.content, `${artifacts.title}.txt`, 'text/plain')
        break
    }
  }
  return {
    isOpen: floatingWindow.open,
    mode: floatingWindow.mode,
    artifacts,
    artifactsType: artifacts.type,
    reloadArtifactsPreview,
    updateArtifacts,
    showArtifacts,
    hideArtifacts,
    setMode,
    downloadArtifacts,
    clearArtifacts,
  }
}
