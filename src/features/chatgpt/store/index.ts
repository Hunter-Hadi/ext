import { atom } from 'recoil'
import Browser from 'webextension-polyfill'

export type ChatGPTClientStatusType =
  | 'loading'
  | 'success'
  | 'needAuth'
  | 'complete'

export const ChatGPTClientState = atom<{
  loaded: boolean
  status: ChatGPTClientStatusType
  port?: Browser.Runtime.Port
  aborts: Array<() => void>
}>({
  key: 'ChatGPTClientState',
  default: {
    loaded: false,
    status: 'loading',
    port: undefined,
    aborts: [],
  },
})

// template: string - 模板文本
// url: string - URL 地址，用于打开网页或启动应用程序
// script: string - 要运行的 JavaScript 代码
// input: any - 输入数据，比如文本、图片等
// variable: any - 捷径中保存的变量值
// output: any - 动作的输出结果
// message: string - 显示给用户的消息
// file: File - 文件对象，用于读取或写入文件
// location: { latitude: number, longitude: number } - 位置坐标
// contact: { name: string, phone: string, email: string } - 联系人信息
// reminder: { title: string, date: Date, notes: string } - 提醒事项信息
export type IPromptAction = {
  id: string
  //动作的类型，比如 "prompt" 或 "openURL"
  type: 'prompt'
  status: 'notRunning' | 'running' | 'complete'
  error?: string
  output?: string
}

// 定义动作接口
interface Action {
  name: string
  execute: (params: any) => void
}

// 定义捷径引擎接口
interface ShortcutEngine {
  actions: Action[]
  execute: (shortcut: Shortcut) => void
}

// 定义捷径接口
interface Shortcut {
  name: string
  actions: { [key: string]: any }[]
}

// 实现一个打印文本的动作
const printAction: Action = {
  name: 'Print Text',
  execute: (params: { text: string }) => {
    console.log(params.text)
  },
}

// 实现一个弹出提示框的动作
const alertAction: Action = {
  name: 'Show Alert',
  execute: (params: { message: string }) => {
    alert(params.message)
  },
}

// 定义一个简单的捷径引擎
const shortcutEngine: ShortcutEngine = {
  actions: [printAction, alertAction],
  execute: (shortcut: Shortcut) => {
    shortcut.actions.forEach((action) => {
      const selectedAction = shortcutEngine.actions.find(
        (a) => a.name === action.name,
      )
      if (selectedAction) {
        selectedAction.execute(action.params)
      }
    })
  },
}
