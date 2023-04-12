class Log {
  module: string
  constructor(modules: string) {
    this.module = modules
      .split('/')
      .map((module) => `[${module.charAt(0).toUpperCase() + module.slice(1)}]`)
      .join('')
  }
  info(...args: any[]): void {
    const stack = this.getCallStack()
    console.log(`${this.module}`, ...args, '\n', stack)
  }
  error(...args: any[]): void {
    const stack = this.getCallStack()
    console.error(`${this.module}`, ...args, '\n', stack)
  }
  warn(...args: any[]): void {
    const stack = this.getCallStack()
    console.warn(`${this.module}`, ...args, '\n', stack)
  }
  getCallStack() {
    const stack = new Error().stack
    if (stack) {
      const stackText = stack.split('\n').slice(2).join('\n')
      const prevStack = stackText?.split(/\n/)?.[1]
      return prevStack
    }
    return ''
  }
}
export default Log
