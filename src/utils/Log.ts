class Log {
  module: string
  constructor(module: string) {
    this.module = module
  }
  info(...args: any[]): void {
    console.log(`[${this.module}]`, ...args)
  }
  error(...args: any[]): void {
    console.error(`[${this.module}]`, ...args)
  }
  warn(...args: any[]): void {
    console.warn(`[${this.module}]`, ...args)
  }
}
export default Log
