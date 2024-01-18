import { TFunction } from 'i18next'
import React from 'react'

import { IAIProviderModel } from '@/features/chatgpt/types'

// 生成图的模型的拓展字段
export interface IArtTextToImageModel extends IAIProviderModel {
  maxGenerateCount: number
  exampleImage: string
  aspectRatios: ArtTextToImageAspectRatioType[]
  contentTypes: ArtTextToImageContentType[]
}

// Ai message 的生成图的字段
export interface IArtTextToImageMetadata {
  generateCount: number
  aspectRatio: string
  contentType: string
  resolution: [number, number]
}

export type ArtTextToImageAspectRatioType = {
  label: (t: TFunction<['common', 'client']>) => React.ReactNode
  value:
    | '4:3'
    | '1:1'
    | '3:4'
    | '16:9'
    | '9:16'
    | '3:2'
    | '2:3'
    | '5:4'
    | '4:5'
    | '7:5'
    | '5:7'
  resolution: [number, number]
}

export type ArtTextToImageContentType = {
  label: (t: TFunction<['common', 'client']>) => React.ReactNode
  value: string
  exampleImage: string
}
