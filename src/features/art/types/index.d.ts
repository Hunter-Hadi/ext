import { TFunction } from 'i18next'
import React from 'react'

import { IAIProviderModel } from '@/features/chatgpt/types'

export interface IArtImageGenerateModel extends IAIProviderModel {
  maxGenerateCount: number
  exampleImage: string
  aspectRatios: ArtImageGenerateAspectRatioType[]
  contentTypes: ArtImageGenerateContentType[]
}

export type ArtImageGenerateAspectRatioType = {
  label: (t: TFunction<['common', 'client']>) => React.ReactNode
  value: '4:3' | '1:1' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3'
  resolution: [number, number]
}

export type ArtImageGenerateContentType = {
  label: (t: TFunction<['common', 'client']>) => React.ReactNode
  value: string
  exampleImage: string
}
