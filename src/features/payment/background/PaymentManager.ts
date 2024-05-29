import Browser from 'webextension-polyfill'

import { IPaymentParams } from '@/features/payment/types'

export class PaymentManager {
  paymentMap: Map<string, IPaymentParams> = new Map()

  addPayment(params: IPaymentParams) {
    this.paymentMap.set(params.paymentUrl, params)
  }

  getPayment(url: string) {
    return this.paymentMap.get(url)
  }

  removePayment(url: string) {
    return this.paymentMap.delete(url)
  }

  closePage(tabId: number, url: string) {
    const payment = this.getPayment(url)
    if (payment?.cancelUrl) {
      // 关闭支付页面，打开支付失败页面
      Browser.tabs.create({
        active: true,
        url: payment.cancelUrl,
      })
    }
    // if (payment) {
    //   this.removePayment(url)
    // }
  }

  changePage(tabId: number, beforeUrl: string, newUrl: string) {
    const payment = this.getPayment(beforeUrl)
    if (payment?.successUrl && newUrl.includes(payment.successUrl)) {
      // 已跳转支付成功页面
      this.removePayment(beforeUrl)
    } else if (payment?.cancelUrl && newUrl.includes(payment.cancelUrl)) {
      // 已跳转支付失败页面
      this.removePayment(beforeUrl)
    } else if (payment?.cancelUrl) {
      // 在支付页面切换到其他页面时候强制跳转支付失败页面
      Browser.tabs.update(tabId, { url: payment.cancelUrl })
    }
  }
}

export default new PaymentManager()
