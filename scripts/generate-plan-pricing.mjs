/**
 * 此文件用于生成A/B Test pricing下各个价格
 */
import fs from 'fs'

const PLAN_PRICING_INFO = {
  free: {
    type: 'free',
    price_id: '',
    dev_price_id: '',
    price: 0,
  },
  basic: {
    type: 'basic',
    price_id: 'price_1P3tyMCdtAdZoE6dUL4RdqA0',
    dev_price_id: 'price_1P3tnJCdtAdZoE6ddvub4IPn',
    price: 9.99,
  },
  basic_yearly: {
    type: 'basic_yearly',
    price_id: 'price_1P3tyMCdtAdZoE6dBncJ8YDN',
    dev_price_id: 'price_1P3tnJCdtAdZoE6dc9NBVcf1',
    price: 99.99,
  },
  basic_one_year: {
    type: 'basic_one_year',
    price_id: 'price_1P3u0MCdtAdZoE6dU6TiOOuy',
    dev_price_id: 'price_1P3u0DCdtAdZoE6dWXxoPxZx',
    price: 99.99,
  },
  basic_team: {
    type: 'basic_team',
    price_id: 'price_1P4v0wCdtAdZoE6dFAS1hMA7',
    dev_price_id: 'price_1P4v0jCdtAdZoE6d47buLU0y',
    price: 9.99,
  },
  pro: {
    type: 'pro',
    price_id: 'price_1NXOaXCdtAdZoE6djhTrjSS3',
    dev_price_id: 'price_1NXOeNCdtAdZoE6d8rNJB4Np',
    price: 20,
  },
  pro_yearly: {
    type: 'pro_yearly',
    price_id: 'price_1PXXDxCdtAdZoE6d7ggGHqP5',
    dev_price_id: 'price_1PXXFLCdtAdZoE6dSRhYwiJQ',
    price: 228,
    discount_title: '5%',
    discount_value: null,
    promotion_code: null,
  },
  pro_one_year: {
    type: 'pro_one_year',
    price_id: 'price_1PYtMFCdtAdZoE6dchoauGTm',
    dev_price_id: 'price_1PYtNGCdtAdZoE6dxYud6bSS',
    price: 228,
    discount_title: '5%',
    discount_value: null,
    promotion_code: null,
  },
  pro_team: {
    type: 'pro_team',
    price_id: 'price_1P4v2pCdtAdZoE6dNfeKBltI',
    dev_price_id: 'price_1P4v3OCdtAdZoE6dcYxK3zP5',
    price: 19.99,
  },
  elite: {
    type: 'elite',
    price_id: 'price_1PE1iiCdtAdZoE6dGAhidDoE',
    dev_price_id: 'price_1PE1hZCdtAdZoE6du9cawaOU',
    price: 40,
  },
  elite_yearly: {
    type: 'elite_yearly',
    price_id: 'price_1O9hEGCdtAdZoE6dFJGfwniM',
    dev_price_id: 'price_1O9hAJCdtAdZoE6dC9DUaE4k',
    price: 300,
    discount_title: '53%',
    discount_value: 0.76,
    promotion_code: 'ELITEYEARLYSPECIAL',
  },
  elite_one_year: {
    type: 'elite_one_year',
    price_id: 'price_1OPYrTCdtAdZoE6dKV3zlC5j',
    dev_price_id: 'price_1OPYppCdtAdZoE6d6g2tinUS',
    price: 300,
    discount_title: '53%',
    discount_value: 0.76,
    promotion_code: 'ELITELIMITEDTIME',
  },
  elite_team: {
    type: 'elite_team',
    price_id: 'price_1PE1efCdtAdZoE6dah7v6LDL',
    dev_price_id: 'price_1PE1dmCdtAdZoE6dXVzi0X0O',
    price: 40,
  },
}

const elite_yearly_19 = {
  price: 300,
  discount_title: '53%',
  discount_value: 0.76,
  promotion_code: 'ELITEYEARLYSPECIAL',
}
const elite_yearly_18 = {
  price: 300,
  discount_title: '55%',
  discount_value: 0.72,
  promotion_code: 'ELITEYEARLYSPECIAL28',
}
const pro_yearly_19 = {
  price: 228,
  discount_title: '5%',
  discount_value: null,
  promotion_code: null,
}
const pro_yearly_18 = {
  price: 228,
  discount_title: '10%',
  discount_value: 0.9473684210526315,
  promotion_code: 'PROYEARLYSPECIAL526',
}
const pro_yearly_17 = {
  price: 228,
  discount_title: '15%',
  discount_value: 0.8947368421052632,
  promotion_code: 'PROYEARLYSPECIAL1052',
}

const AB_TEST_LIST = [
  {
    name: '6-1',
    info: {
      elite_yearly: {
        ...PLAN_PRICING_INFO.elite_yearly,
        ...elite_yearly_19,
      },
      elite_one_year: {
        ...PLAN_PRICING_INFO.elite_one_year,
        ...elite_yearly_19,
      },
      pro_yearly: {
        ...PLAN_PRICING_INFO.pro_yearly,
        ...pro_yearly_19
      },
      pro_one_year: {
        ...PLAN_PRICING_INFO.pro_one_year,
        ...pro_yearly_19
      }
    }
  },
  {
    name: '6-2',
    info: {
      elite_yearly: {
        ...PLAN_PRICING_INFO.elite_yearly,
        ...elite_yearly_19,
      },
      elite_one_year: {
        ...PLAN_PRICING_INFO.elite_one_year,
        ...elite_yearly_19,
      },
      pro_yearly: {
        ...PLAN_PRICING_INFO.pro_yearly,
        ...pro_yearly_18
      },
      pro_one_year: {
        ...PLAN_PRICING_INFO.pro_one_year,
        ...pro_yearly_18
      }
    }
  },
  {
    name: '6-3',
    info: {
      elite_yearly: {
        ...PLAN_PRICING_INFO.elite_yearly,
        ...elite_yearly_18
      },
      elite_one_year: {
        ...PLAN_PRICING_INFO.elite_one_year,
        ...elite_yearly_18
      },
      pro_yearly: {
        ...PLAN_PRICING_INFO.pro_yearly,
        ...pro_yearly_18
      },
      pro_one_year: {
        ...PLAN_PRICING_INFO.pro_one_year,
        ...pro_yearly_18
      }
    }
  },
  {
    name: '6-4',
    info: {
      elite_yearly: {
        ...PLAN_PRICING_INFO.elite_yearly,
        ...elite_yearly_18
      },
      elite_one_year: {
        ...PLAN_PRICING_INFO.elite_one_year,
        ...elite_yearly_18
      },
      pro_yearly: {
        ...PLAN_PRICING_INFO.pro_yearly,
        ...pro_yearly_17
      },
      pro_one_year: {
        ...PLAN_PRICING_INFO.pro_one_year,
        ...pro_yearly_17
      }
    }
  },
  {
    name: '6-5',
    info: {
      elite_yearly: {
        ...PLAN_PRICING_INFO.elite_yearly,
        ...elite_yearly_18
      },
      elite_one_year: {
        ...PLAN_PRICING_INFO.elite_one_year,
        ...elite_yearly_18
      },
      pro_yearly: {
        ...PLAN_PRICING_INFO.pro_yearly,
        ...pro_yearly_19
      },
      pro_one_year: {
        ...PLAN_PRICING_INFO.pro_one_year,
        ...pro_yearly_19
      }
    }
  }
]

AB_TEST_LIST.forEach(item => {
  const abTestInfo = { ...PLAN_PRICING_INFO, ...item.info }
  abTestInfo.basic_monthly = abTestInfo.basic
  abTestInfo.pro_monthly = abTestInfo.pro
  abTestInfo.elite_monthly = abTestInfo.elite
  delete abTestInfo.free
  delete abTestInfo.basic
  delete abTestInfo.pro
  delete abTestInfo.elite
  fs.writeFileSync(`${item.name}.json`, JSON.stringify(abTestInfo, null, 2))
})