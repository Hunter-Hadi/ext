export type PropsType<T> = T extends (...args: infer P) => any ? P[0] : never
