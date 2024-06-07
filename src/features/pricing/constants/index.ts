import { isProduction } from '@/constants'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'

export const PRICE_ID_MAP: Record<RENDER_PLAN_TYPE, string> = {
  free: '',

  basic: isProduction
    ? 'price_1P3tyMCdtAdZoE6dUL4RdqA0'
    : 'price_1P3tnJCdtAdZoE6ddvub4IPn',
  basic_yearly: isProduction
    ? 'price_1P3tyMCdtAdZoE6dBncJ8YDN'
    : 'price_1P3tnJCdtAdZoE6dc9NBVcf1',
  basic_team: isProduction
    ? 'price_1P4v0wCdtAdZoE6dFAS1hMA7'
    : 'price_1P4v0jCdtAdZoE6d47buLU0y',

  pro: isProduction
    ? 'price_1NXOaXCdtAdZoE6djhTrjSS3'
    : 'price_1NXOeNCdtAdZoE6d8rNJB4Np',
  pro_yearly: isProduction
    ? 'price_1PEDMjCdtAdZoE6daVcPIdWf'
    : 'price_1PEDMRCdtAdZoE6dkT9UbTjk',
  pro_team: isProduction
    ? 'price_1P4v2pCdtAdZoE6dNfeKBltI'
    : 'price_1P4v3OCdtAdZoE6dcYxK3zP5',

  elite: isProduction
    ? 'price_1PE1iiCdtAdZoE6dGAhidDoE'
    : 'price_1PE1hZCdtAdZoE6du9cawaOU',
  elite_yearly: isProduction
    ? 'price_1O9hEGCdtAdZoE6dFJGfwniM'
    : 'price_1O9hAJCdtAdZoE6dC9DUaE4k',
  elite_team: isProduction
    ? 'price_1PE1efCdtAdZoE6dah7v6LDL'
    : 'price_1PE1dmCdtAdZoE6dXVzi0X0O',

  basic_one_year: isProduction
    ? 'price_1P3u0MCdtAdZoE6dU6TiOOuy'
    : 'price_1P3u0DCdtAdZoE6dWXxoPxZx',

  pro_one_year: isProduction
    ? 'price_1PEDKMCdtAdZoE6dj6f71An0'
    : 'price_1PEDLYCdtAdZoE6dEcVWy66l',

  elite_one_year: isProduction
    ? 'price_1OPYrTCdtAdZoE6dKV3zlC5j'
    : 'price_1OPYppCdtAdZoE6d6g2tinUS',
}

// plan price per month
export const PLAN_PRICE_MAP: Record<RENDER_PLAN_TYPE, number> = {
  free: 0,

  basic: 9.99,
  basic_yearly: 99.99,
  basic_one_year: 99.99,
  basic_team: 9.99,

  pro: 20,
  pro_yearly: 192,
  pro_one_year: 192,
  pro_team: 19.99,

  elite: 40,
  elite_yearly: 300,
  elite_one_year: 300,
  elite_team: 40,
}

export const PLAN_FAIL_NAMES: Record<RENDER_PLAN_TYPE, string> = {
  free: '',
  basic: 'BASIC_MONTHLY',
  basic_yearly: 'BASIC_YEARLY',
  basic_one_year: 'BASIC_ONE_YEAR',
  basic_team: 'BASIC_TEAM_MONTHLY',
  pro: 'PRO_MONTHLY',
  pro_yearly: 'PRO_YEARLY',
  pro_one_year: 'PRO_ONE_YEAR',
  pro_team: 'PRO_TEAM_MONTHLY',
  elite: 'ELITE_MONTHLY',
  elite_yearly: 'ELITE_YEARLY',
  elite_one_year: 'ELITE_ONE_YEAR',
  elite_team: 'ELITE_TEAM_MONTHLY',
}

export const DISCOUNT_VALUE: Record<RENDER_PLAN_TYPE, number> = {
  free: 0,

  basic: 0,
  basic_yearly: 0,
  basic_team: 0,
  basic_one_year: 0,

  pro: 0,
  pro_yearly: 0.75,
  pro_team: 0,
  pro_one_year: 0.75,

  elite: 0,
  elite_yearly: 0.76,
  elite_team: 0,
  elite_one_year: 0.76,
}

export const PROMOTION_CODE_MAP: Partial<Record<RENDER_PLAN_TYPE, string>> = {
  elite_yearly: 'ELITELIMITEDTIME',
  elite_one_year: 'ELITELIMITEDTIME',
  pro_yearly: 'PROLIMITEDTIME',
  pro_one_year: 'PROLIMITEDTIME',
}
