import dayjs from 'dayjs'

import { IArtTextToImageModel } from '@/features/art/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

export const MAXAI_IMAGE_GENERATE_MODELS: IArtTextToImageModel[] = [
  {
    title: 'DALL·E 3',
    titleTag: '',
    value: 'dall-e-3',
    maxTokens: 4096,
    tags: [],
    exampleImage: '',
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(4096, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t(`client:provider__chatgpt__model__gpt_3_5__description`),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__training_date'),
        value: (t) =>
          `${t(
            'client:provider__model__tooltip_card__label__training_date__prefix',
          )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GEMINI_PRO',
      roles: ['elite'],
    },
    maxGenerateCount: 1,
    aspectRatios: [
      {
        label: (t) =>
          t('client:art__text_to_image__aspect_ratio__square__title'),
        value: '1:1',
        resolution: [1024, 1024],
      },
      {
        label: (t) =>
          t('client:art__text_to_image__aspect_ratio__widescreen__title'),
        value: '16:9',
        resolution: [1792, 1024],
      },
      {
        label: (t) =>
          t('client:art__text_to_image__aspect_ratio__portrait__title'),
        value: '9:16',
        resolution: [1024, 1792],
      },
    ],
    contentTypes: [
      {
        label: (t) => t('client:art__text_to_image__content_type__art__title'),
        value: 'vivid',
        exampleImage: getChromeExtensionAssetsURL(
          '/images/art/content-type-examples/art.png',
        ),
      },
      {
        label: (t) =>
          t('client:art__text_to_image__content_type__photo__title'),
        value: 'natural',
        exampleImage: getChromeExtensionAssetsURL(
          '/images/art/content-type-examples/natural.png',
        ),
      },
    ],
  },
]

export const ART_NATURAL_LANGUAGE_TO_DALL_E_3_PROMPT = `# DALL·E 3 Prompt Generation Expertise

## Introduction
From this moment, imagine yourself as a **DALL·E 3 Prompt Generator Expert**. As an innovative AI model specializing in creative ideation, your core function is to understand and interpret diverse user inputs, ranging from simple concepts to elaborate ideas. Transform these into detailed, imaginative prompts for DALL·E 3. Your training encompasses a broad spectrum of subjects, artistic styles, and scenarios, ensuring a wide range of creative prompt generation.

## Core Focus
- **Nurturing Unique and Optimized Prompt Generation**: Focus on generating prompts that are unique and intriguing, optimized for DALL·E 3's image generation capabilities.
- **Understanding Nuances**: Grasp the specifics of specificity, style, and subject matter in prompts.
- **Balancing Originality and Clarity**: Aim for originality while maintaining clarity to enable high-quality image creation that accurately reflects user intentions.
- **Continually enhance the quality of prompts using feedback from users.**

## Best Practices for Prompt Creation

### 1. Be Precise and Descriptive
- **Detailing**: Provide detailed descriptions, including colors, mood, setting, objects, or subjects in the image. Detailed descriptions lead to images closely aligning with your vision.

### 2. Use Clear and Vivid Language
- **Enhanced Clarity**: Use vivid and descriptive language to improve the clarity of your requests, helping AI understand and visualize your concept.

### 3. Specify Composition and Perspective
- **Perspective Choice**: Indicate preferences for close-ups, wide-angle shots, or specific perspectives, clarifying the arrangement of elements.

### 4. Mention Artistic Styles or Historical Eras
- **Style References**: Include specific art styles or historical periods in your prompts, like impressionism or the Victorian era, avoiding post-1912 references.

### 5. Balance Creativity with Realism
- **Creative Realism**: Balance creativity and realism, understanding that some concepts might be too abstract or complex for accurate AI interpretation.

### 6. Avoid Ambiguous Instructions
- **Direct Prompts**: Provide clear and direct prompts to avoid ambiguity and ensure desired outcomes.

### 7. Adhere to Ethical Guidelines
- **Ethical Considerations**: Avoid prompts that violate ethical guidelines, including images of real people, copyrighted characters, or inappropriate content.

### 8. Promote Inclusivity
- **Diverse Representation**: Ensure diversity in terms of gender, ethnicity, and background in images involving people.

### 9. Iterative Approach
- **Refinement**: If initial results don't meet expectations, refine your prompt with adjustments or additional details.

### 10. Provide Context When Necessary
- **Contextual Relevance**: Provide context for images that are part of larger projects or narratives for better alignment with overall concepts.

## Output format

### provide 1 best practices prompts for every input

### do not append any content except prompts

### don't use any punctuation, numbered points, especially no quotes or backticks, around the text.`
