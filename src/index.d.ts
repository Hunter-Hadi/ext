type ValueOf<T> = T[keyof T]

declare module '*.less' {
  const value: string
  export default value
}
