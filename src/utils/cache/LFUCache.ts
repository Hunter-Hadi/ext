class LFUCache<K, V> {
  private capacity: number
  private cache: Map<K, [V, number[]]> // Key-value pair with frequency
  private frequencies: Map<number, Set<K>> // Frequency with set of keys
  private timeWindow: number = 1000 * 60 * 60 * 24 * 7 // 7 days
  // private timeWindow: number = 1000 * 60 * 2 // 2mins
  constructor(capacity: number) {
    this.capacity = capacity
    this.cache = new Map()
    this.frequencies = new Map()
  }

  updateCapacity(capacity: number) {
    this.capacity = capacity
    while (this.cache.size > this.capacity) {
      this.evictLFUEntry()
    }
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const [value, timeFrequency] = this.cache.get(key)!
      timeFrequency.push(Date.now())
      this.cache.set(key, [value, timeFrequency])
      this.updateFrequency(key, timeFrequency.length)
      return value
    }
    return undefined
  }
  getCache(): Map<K, [V, number[]]> {
    return this.cache
  }
  refreshFrequency() {
    this.cache.forEach(([value, timeFrequency], key) => {
      const savedTimeFrequency = this.filterTimeFrequency(timeFrequency)
      this.cache.set(key, [value, savedTimeFrequency])
      this.updateFrequency(key, savedTimeFrequency.length)
    })
  }

  set(key: K, value: V) {
    if (this.capacity === 0) return

    if (this.cache.has(key)) {
      const [, timeFrequency] = this.cache.get(key)!
      timeFrequency.push(Date.now())
      const savedTimeFrequency = this.filterTimeFrequency(timeFrequency)
      this.cache.set(key, [value, savedTimeFrequency])
      this.updateFrequency(key, savedTimeFrequency.length)
    } else {
      if (this.cache.size >= this.capacity) {
        this.evictLFUEntry()
      }
      this.cache.set(key, [value, [Date.now()]])
      this.updateFrequency(key, 1)
    }
  }

  private filterTimeFrequency(timeFrequency: number[]) {
    const start = Date.now() - this.timeWindow
    return timeFrequency.filter((time) => time > start)
  }

  private updateFrequency(key: K, newFrequency: number) {
    const keys = this.frequencies.get(Math.max(newFrequency - 1, 0))
    if (keys) {
      keys.delete(key)
      if (keys.size === 0) {
        this.frequencies.delete(newFrequency)
      }
    }
    if (!this.frequencies.has(newFrequency)) {
      this.frequencies.set(newFrequency, new Set())
    }
    this.frequencies.get(newFrequency)!.add(key)
  }

  private evictLFUEntry() {
    const minFrequency = Math.min(...this.frequencies.keys())
    const keys = this.frequencies.get(minFrequency)!
    const keyToRemove = keys.values().next().value
    keys.delete(keyToRemove)
    if (keys.size === 0) {
      this.frequencies.delete(minFrequency)
    }
    this.cache.delete(keyToRemove)
  }
}
export default LFUCache
