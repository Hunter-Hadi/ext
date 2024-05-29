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
      // chrome.webNavigation为敏感权限，目前在content_script里无法准确监听到浏览器的后退前进事件
      // 所以这里只去判断返回的链接是否和cancelUrl是同一个域名并且地址不一样就跳到支付失败页面
      if (
        new URL(payment.cancelUrl).origin === new URL(newUrl).origin &&
        !newUrl.includes(payment.cancelUrl)
      ) {
        Browser.tabs.update(tabId, { url: payment.cancelUrl })
      }
    }
  }
}

export default new PaymentManager()
