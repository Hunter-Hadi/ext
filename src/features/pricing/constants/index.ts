import { TFunction } from 'i18next'
import React from 'react'

import { isProduction } from '@/constants'
import { IPlanPricingInfo, RENDER_PLAN_TYPE } from '@/features/pricing/type'

/**
 * 配置各个plan的信息
 * 这里和接口返回信息一致
 */
export const PLAN_PRICING_MAP: Record<RENDER_PLAN_TYPE, IPlanPricingInfo> = {
  free: {
    type: 'free',
    price_id: '',
    price: 0,
  },
  basic: {
    type: 'basic',
    price_id: isProduction
      ? 'price_1P3tyMCdtAdZoE6dUL4RdqA0'
      : 'price_1P3tnJCdtAdZoE6ddvub4IPn',
    price: 9.99,
  },
  basic_yearly: {
    type: 'basic_yearly',
    price_id: isProduction
      ? 'price_1P3tyMCdtAdZoE6dBncJ8YDN'
      : 'price_1P3tnJCdtAdZoE6dc9NBVcf1',
    price: 99.99,
  },
  basic_one_year: {
    type: 'basic_one_year',
    price_id: isProduction
      ? 'price_1P3u0MCdtAdZoE6dU6TiOOuy'
      : 'price_1P3u0DCdtAdZoE6dWXxoPxZx',
    price: 99.99,
  },
  basic_team: {
    type: 'basic_team',
    price_id: isProduction
      ? 'price_1P4v0wCdtAdZoE6dFAS1hMA7'
      : 'price_1P4v0jCdtAdZoE6d47buLU0y',
    price: 9.99,
  },
  pro: {
    type: 'pro',
    price_id: isProduction
      ? 'price_1NXOaXCdtAdZoE6djhTrjSS3'
      : 'price_1NXOeNCdtAdZoE6d8rNJB4Np',
    price: 20,
  },
  pro_yearly: {
    type: 'pro_yearly',
    price_id: isProduction
      ? 'price_1PEDMjCdtAdZoE6daVcPIdWf'
      : 'price_1PEDMRCdtAdZoE6dkT9UbTjk',
    price: 192,
    discount_title: '20%',
    discount_value: null, // 0.75, // 插件不对pro做额外折扣
    promotion_code: null, // 'PROLIMITEDTIME',
  },
  pro_one_year: {
    type: 'pro_one_year',
    price_id: isProduction
      ? 'price_1PEDKMCdtAdZoE6dj6f71An0'
      : 'price_1PEDLYCdtAdZoE6dEcVWy66l',
    price: 192,
    discount_title: '20%',
    discount_value: null, // 0.75, // 插件不对pro做额外折扣
    promotion_code: null, // 'PROLIMITEDTIME',
  },
  pro_team: {
    type: 'pro_team',
    price_id: isProduction
      ? 'price_1P4v2pCdtAdZoE6dNfeKBltI'
      : 'price_1P4v3OCdtAdZoE6dcYxK3zP5',
    price: 19.99,
  },
  elite: {
    type: 'elite',
    price_id: isProduction
      ? 'price_1PE1iiCdtAdZoE6dGAhidDoE'
      : 'price_1PE1hZCdtAdZoE6du9cawaOU',
    price: 40,
  },
  elite_yearly: {
    type: 'elite_yearly',
    price_id: isProduction
      ? 'price_1O9hEGCdtAdZoE6dFJGfwniM'
      : 'price_1O9hAJCdtAdZoE6dC9DUaE4k',
    price: 300,
    discount_title: '53%',
    discount_value: 0.76,
    promotion_code: 'ELITELIMITEDTIME',
  },
  elite_one_year: {
    type: 'elite_one_year',
    price_id: isProduction
      ? 'price_1OPYrTCdtAdZoE6dKV3zlC5j'
      : 'price_1OPYppCdtAdZoE6d6g2tinUS',
    price: 300,
    discount_title: '53%',
    discount_value: 0.76,
    promotion_code: 'ELITELIMITEDTIME',
  },
  elite_team: {
    type: 'elite_team',
    price_id: isProduction
      ? 'price_1PE1efCdtAdZoE6dah7v6LDL'
      : 'price_1PE1dmCdtAdZoE6dXVzi0X0O',
    price: 40,
  },
}

/**
 * 不同 plan 对应的 productivity 价值
 */
export const PLAN_PRODUCTIVITY_VALUES: Record<RENDER_PLAN_TYPE, number> = {
  free: 0,

  basic: 1,
  basic_yearly: 1,
  basic_team: 1,
  basic_one_year: 1,

  pro: 3,
  pro_yearly: 3,
  pro_team: 3,
  pro_one_year: 3,

  elite: 5,
  elite_yearly: 5,
  elite_team: 5,
  elite_one_year: 5,
}

/**
 * 不同plan支付失败后跳转的失败链接里的url参数
 */
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

/**
 * plan功能介绍，目前只有elite和pro的
 */
export const PLAN_FEATURES_MAP: Partial<
  Record<
    'elite' | 'pro',
    {
      description: (t: TFunction<['common', 'client']>) => React.ReactNode
      features: (t: TFunction<['common', 'client']>) => {
        title: React.ReactNode
        items: {
          title: React.ReactNode
          tooltip: React.ReactNode
        }[]
      }[]
    }
  >
> = {
  elite: {
    description: (t) => t('client:pricing__plan_features__elite__description'),
    features: (t) => [
      {
        title: t('client:pricing__plan_features__elite__feature1__title'),
        items: [
          {
            title: t(
              'client:pricing__plan_features__elite__feature1__item1__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__elite__feature1__item1__tooltip',
            ),
          },
          {
            title: t(
              'client:pricing__plan_features__elite__feature1__item2__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__elite__feature1__item2__tooltip',
            ),
          },
          {
            title: t(
              'client:pricing__plan_features__elite__feature1__item3__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__elite__feature1__item3__tooltip',
            ),
          },
        ],
      },
      {
        title: t('client:pricing__plan_features__elite__feature2__title'),
        items: [
          {
            title: t(
              'client:pricing__plan_features__elite__feature2__item1__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__elite__feature2__item1__tooltip',
            ),
          },
          {
            title: t(
              'client:pricing__plan_features__elite__feature2__item2__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__elite__feature2__item2__tooltip',
            ),
          },
          {
            title: t(
              'client:pricing__plan_features__elite__feature2__item3__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__elite__feature2__item3__tooltip',
            ),
          },
        ],
      },
      {
        title: t('client:pricing__plan_features__elite__feature3__title'),
        items: [
          {
            title: t(
              'client:pricing__plan_features__elite__feature3__item1__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__elite__feature3__item1__tooltip',
            ),
          },
          {
            title: t(
              'client:pricing__plan_features__elite__feature3__item2__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__elite__feature3__item2__tooltip',
            ),
          },
          {
            title: t(
              'client:pricing__plan_features__elite__feature3__item3__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__elite__feature3__item3__tooltip',
            ),
          },
        ],
      },
    ],
  },
  pro: {
    description: (t) => t('client:pricing__plan_features__pro__description'),
    features: (t) => [
      {
        title: t('client:pricing__plan_features__pro__feature1__title'),
        items: [
          {
            title: t(
              'client:pricing__plan_features__pro__feature1__item1__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__pro__feature1__item1__tooltip',
            ),
          },
          {
            title: t(
              'client:pricing__plan_features__pro__feature1__item2__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__pro__feature1__item2__tooltip',
            ),
          },
          {
            title: '',
            tooltip: '',
          },
        ],
      },
      {
        title: t('client:pricing__plan_features__pro__feature2__title'),
        items: [
          {
            title: t(
              'client:pricing__plan_features__pro__feature2__item1__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__pro__feature2__item1__tooltip',
            ),
          },
          {
            title: t(
              'client:pricing__plan_features__pro__feature2__item2__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__pro__feature2__item2__tooltip',
            ),
          },
          {
            title: t(
              'client:pricing__plan_features__pro__feature2__item3__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__pro__feature2__item3__tooltip',
            ),
          },
        ],
      },
      {
        title: t('client:pricing__plan_features__pro__feature3__title'),
        items: [
          {
            title: t(
              'client:pricing__plan_features__pro__feature3__item1__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__pro__feature3__item1__tooltip',
            ),
          },
          {
            title: t(
              'client:pricing__plan_features__pro__feature3__item2__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__pro__feature3__item2__tooltip',
            ),
          },
          {
            title: t(
              'client:pricing__plan_features__pro__feature3__item3__title',
            ),
            tooltip: t(
              'client:pricing__plan_features__pro__feature3__item3__tooltip',
            ),
          },
        ],
      },
    ],
  },
}
