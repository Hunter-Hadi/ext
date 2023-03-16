import { IActionType } from '@/features/shortcuts/types'
import Action from '@/features/shortcuts/core/Action'
import {
  pushOutputToChat,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
import { gmailReplyBoxInsertText } from '@/features/gmail/utils'

export class ActionGmailInsertReplyBox extends Action {
  static type = 'GMAIL_INSERT_REPLY_BOX'
  constructor(
    id: string,
    type: IActionType,
    parameters: any,
    autoExecute: boolean,
  ) {
    super(id, 'GMAIL_INSERT_REPLY_BOX', parameters, autoExecute)
  }
  @templateParserDecorator()
  @pushOutputToChat()
  async execute(params: any, engine: any) {
    const bodyElement = engine
      .getInbox()
      ?.currentComposeView?.getInstance()
      ?.getBodyElement()
    if (bodyElement) {
      gmailReplyBoxInsertText(
        bodyElement,
        this.parameters?.compliedTemplate || params?.LAST_ACTION_OUTPUT || '',
      )
      this.output = `success insert reply box.`
    } else {
      this.error = `cannot find body element.`
    }
  }
}
