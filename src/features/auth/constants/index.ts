import { IUserRoleType } from '@/features/auth/types'

// 付费 user 可能存在的 role name
export const PAYING_USER_ROLE_NAME: IUserRoleType[] = ['basic', 'pro', 'elite']

// 角色优先级值
export const USER_ROLE_PRIORITY: Record<IUserRoleType, number> = {
  new_user: 0,
  pro_gift: 0,
  free: 0,
  free_trial: 0,
  basic: 1,
  pro: 2,
  elite: 3,
}
