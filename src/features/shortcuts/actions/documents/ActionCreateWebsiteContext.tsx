import lodashSet from 'lodash-es/set'

import { templateParserDecorator } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { IWebsiteContext } from '@/features/websiteContext/background'
import {
  clientCreateWebsiteContext,
  clientUpdateWebsiteContext,
} from '@/features/websiteContext/client'
import { clientRunBackgroundGetScreenshot } from '@/utils/clientCallChromeExtensionCollection'

export class ActionCreateWebsiteContext extends Action {
  static type: ActionIdentifier = 'CREATE_WEBSITE_CONTEXT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }

  @templateParserDecorator()
  async execute(params: ActionParameters, engine: any) {
    try {
      const CreateWebsiteContextConfig = (this.parameters
        .CreateWebsiteContextConfig || {}) as any
      const websiteContext: Partial<IWebsiteContext> = {}
      // 渲染模板变量赋值给要创建的websiteContext
      if (CreateWebsiteContextConfig) {
        Object.keys(CreateWebsiteContextConfig).forEach((key) => {
          // action传递过来的变量名
          const variableName = CreateWebsiteContextConfig[key]
          if (typeof CreateWebsiteContextConfig[key] === 'string') {
            lodashSet(
              websiteContext,
              key,
              engine.getShortCutsEngine()?.parseTemplate(variableName) ||
                CreateWebsiteContextConfig[key],
            )
          } else if (typeof CreateWebsiteContextConfig[key] === 'object') {
            Object.keys(CreateWebsiteContextConfig[key]).forEach((subKey) => {
              const subVariableName = CreateWebsiteContextConfig[key][subKey]
              lodashSet(
                websiteContext,
                `${key}.${subKey}`,
                engine.getShortCutsEngine()?.parseTemplate(subVariableName) ||
                  CreateWebsiteContextConfig[key][subKey],
              )
            })
          }
        })
      }
      websiteContext.sidebarType = this.getCurrentSidebarType(engine)
      const createdWebsiteContext = await clientCreateWebsiteContext(
        websiteContext,
      )
      if (
        createdWebsiteContext?.id &&
        !createdWebsiteContext.meta?.screenshot
      ) {
        const getScreenshotFn = () => {
          clientRunBackgroundGetScreenshot().then((screenshot) => {
            if (screenshot) {
              clientUpdateWebsiteContext(
                {
                  id: createdWebsiteContext.id,
                },
                {
                  meta: {
                    screenshot,
                  },
                },
              )
            }
          })

          window.removeEventListener('focus', getScreenshotFn)
        }

        if (document.hasFocus()) {
          getScreenshotFn()
        } else {
          window.addEventListener('focus', getScreenshotFn)
        }
      }
      this.output = websiteContext.id
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
