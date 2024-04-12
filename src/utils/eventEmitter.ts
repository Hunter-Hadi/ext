export type EventListener = (...args: any[]) => void

export class EventEmitter {
  protected _events: Map<string, EventListener[]>

  constructor() {
    this._events = new Map()
  }

  on(eventName: string, listener: EventListener) {
    if (!this._events.has(eventName)) {
      this._events.set(eventName, [])
    }
    this._events.get(eventName)!.push(listener)
  }

  off(eventName: string, listener: EventListener) {
    const listeners = this._events.get(eventName)
    if (listeners && listeners.length) {
      this._events.set(
        eventName,
        listeners.filter((item) => item !== listener),
      )
    }
  }

  emit(eventName: string, ...args: any[]) {
    const listeners = this._events.get(eventName)
    if (listeners && listeners.length) {
      listeners.forEach((listener) => {
        listener(...args)
      })
    }
  }

  addListener(eventName: string, listener: EventListener) {
    this.on(eventName, listener)
  }

  removeListener(eventName: string, listener: EventListener) {
    this.off(eventName, listener)
  }

  removeAllListeners(eventName?: string) {
    if (eventName) {
      this._events.delete(eventName)
    } else {
      this._events.clear()
    }
  }
}
