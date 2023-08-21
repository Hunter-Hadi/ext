import Log from '@/utils/Log'

interface InputMediator {
  subscribe(subscriber: Subscriber): void
  unsubscribe(subscriber: Subscriber): void
  updateInputValue(newValue: string, extraData?: any): void
  getInputValue(): string
}

type Subscriber = (value: string, extraData: any) => void

const log = new Log('ChatBoxInputMediator')

class ChatBoxInputMediator implements InputMediator {
  private inputValue = ''
  private subscribers: Subscriber[] = []

  subscribe(subscriber: Subscriber): void {
    this.subscribers.push(subscriber)
  }
  unsubscribe(subscriber: Subscriber): void {
    this.subscribers = this.subscribers.filter(
      (existingSubscriber) => existingSubscriber !== subscriber,
    )
  }
  updateInputValue(newValue: string, extraData?: any): void {
    log.info('updateInputValue', newValue)
    this.inputValue = newValue
    this.notifySubscribers(extraData)
  }
  getInputValue(): string {
    return this.inputValue
  }

  private notifySubscribers(extraData?: any): void {
    this.subscribers.forEach((subscriber) => {
      subscriber(this.inputValue, extraData)
    })
  }
}

class FloatingMenuInputMediator implements InputMediator {
  private inputValue = ''
  private subscribers: Subscriber[] = []

  subscribe(subscriber: Subscriber): void {
    this.subscribers.push(subscriber)
  }
  unsubscribe(subscriber: Subscriber): void {
    this.subscribers = this.subscribers.filter(
      (existingSubscriber) => existingSubscriber !== subscriber,
    )
  }
  updateInputValue(newValue: string, extraData?: any): void {
    log.info('updateInputValue', newValue)
    this.inputValue = newValue
    this.notifySubscribers(extraData)
  }
  getInputValue(): string {
    return this.inputValue
  }

  private notifySubscribers(extraData: any): void {
    this.subscribers.forEach((subscriber) => {
      subscriber(this.inputValue, extraData)
    })
  }
}

export type InputMediatorName =
  | 'chatBoxInputMediator'
  | 'floatingMenuInputMediator'

class InputMediatorFactory {
  private static mediators: Record<InputMediatorName, InputMediator> = {
    chatBoxInputMediator: new ChatBoxInputMediator(),
    floatingMenuInputMediator: new FloatingMenuInputMediator(),
  }
  public static getMediator(
    mediatorName: 'chatBoxInputMediator',
  ): InputMediator {
    return InputMediatorFactory.mediators[mediatorName]
  }
}

export const getInputMediator = (mediatorName: InputMediatorName) => {
  return InputMediatorFactory.getMediator(mediatorName as any)
}
