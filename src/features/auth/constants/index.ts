import { IUserRoleType } from '@/features/auth/types'

// 付费 user 可能存在的 role name
export const PAYING_USER_ROLE_NAME: IUserRoleType[] = ['basic', 'pro', 'elite']

export const AI_MODEL_SERVICE_TEXTS_MAP = {
  fastText: 'GPT-3.5 & Claude-3-haiku & Gemini-pro',
  advancedText: 'GPT-4 & Claude-3-opus/sonnet & Gemini-1.5-pro',
  imageGenerate: 'DALL·E 3',
}
