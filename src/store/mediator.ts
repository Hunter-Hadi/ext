import Log from '@/utils/Log'

interface Mediator {
  subscribe(subscriber: Subscriber): void
  unsubscribe(subscriber: Subscriber): void
  updateInputValue(newValue: string): void
  getInputValue(): string
}

type Subscriber = (value: string) => void

const log = new Log('ChatBoxInputMediator')

class ChatBoxInputMediator implements Mediator {
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
  updateInputValue(newValue: string): void {
    log.info('updateInputValue', newValue)
    this.inputValue = newValue
    this.notifySubscribers()
  }
  getInputValue(): string {
    return this.inputValue
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((subscriber) => {
      subscriber(this.inputValue)
    })
  }
}

class FloatingMenuInputMediator implements Mediator {
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
  updateInputValue(newValue: string): void {
    log.info('updateInputValue', newValue)
    this.inputValue = newValue
    this.notifySubscribers()
  }
  getInputValue(): string {
    return this.inputValue
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((subscriber) => {
      subscriber(this.inputValue)
    })
  }
}

export type MediatorName = 'chatBoxInputMediator' | 'floatingMenuInputMediator'

class MediatorFactory {
  private static mediators: Record<MediatorName, Mediator> = {
    chatBoxInputMediator: new ChatBoxInputMediator(),
    floatingMenuInputMediator: new FloatingMenuInputMediator(),
  }
  public static getMediator(mediatorName: 'chatBoxInputMediator'): Mediator {
    return MediatorFactory.mediators[mediatorName]
  }
}

export const getMediator = (mediatorName: MediatorName) => {
  return MediatorFactory.getMediator(mediatorName as any)
}
