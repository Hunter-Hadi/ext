import Browser from 'webextension-polyfill'

export type IBackgroundRunCommandKey = keyof typeof Browser

export type IBackgroundRunCommandFunctionKey<
  T extends IBackgroundRunCommandKey
> = keyof typeof Browser[T]

export type IBackgroundRunCommandFunctionParams<
  T extends IBackgroundRunCommandKey,
  K extends IBackgroundRunCommandFunctionKey<T>
> = typeof Browser[T][K] extends (...args: infer Args) => Promise<any>
  ? Args
  : never

export type IBackgroundRunCommandFunctionReturn<
  T extends IBackgroundRunCommandKey,
  K extends IBackgroundRunCommandFunctionKey<T>
> = typeof Browser[T][K] extends (...args: any) => Promise<infer Result>
  ? Result
  : never

const backgroundCommandHandler = async <
  T extends IBackgroundRunCommandKey,
  K extends IBackgroundRunCommandFunctionKey<T>
>(
  command: T,
  commandFunctionName: K,
  commandFunctionData: IBackgroundRunCommandFunctionParams<T, K>,
) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    try {
      const needRunFunctionOrData = commandFunctionName
        ? (Browser as any)?.[command]?.[commandFunctionName]
        : (Browser as any)?.[command]
      if (typeof needRunFunctionOrData === 'function') {
        const result = await needRunFunctionOrData(...commandFunctionData)
        resolve(result)
      } else {
        resolve(needRunFunctionOrData)
      }
    } catch (e) {
      resolve(undefined)
    }
  })
}

export default backgroundCommandHandler
