export type CacheMeta = {
    key: string
    lastUsed: number
    freq: number
    createdAt: number
  }
  
  export type CustomEvictionPick = (entries: CacheMeta[]) => string
  
  export type EvictionMode =
    | 'lru'
    | 'lfu'
    | { type: 'custom'; pickKey: CustomEvictionPick }
  
  export type MemoizeOptions = {
    maxSize?: number
    eviction?: EvictionMode
    ttlMs?: number
    serializeArgs?: (args: unknown[]) => string
  }
  
  type Entry<V> = {
    value: V
    lastUsed: number
    freq: number
    createdAt: number
  }
  
  const defaultSerialize = (args: unknown[]): string => {
    try {
      return JSON.stringify(args)
    } catch {
      return String(args)
    }
  }
  
  function collectMeta<V>(cache: Map<string, Entry<V>>): CacheMeta[] {
    const out: CacheMeta[] = []
    for (const [key, e] of cache) {
      out.push({
        key,
        lastUsed: e.lastUsed,
        freq: e.freq,
        createdAt: e.createdAt
      })
    }
    return out
  }
  
  function evictOne<V>(
    cache: Map<string, Entry<V>>,
    eviction: EvictionMode | undefined
  ): void {
    if (cache.size === 0) return
  
    const mode = eviction ?? 'lru'
  
    if (mode === 'lru') {
      const victim = cache.keys().next().value as string
      cache.delete(victim)
      return
    }
  
    if (mode === 'lfu') {
      let victim: string | null = null
      let bestFreq = Infinity
      let bestLast = Infinity
  
      for (const [key, e] of cache) {
        if (e.freq < bestFreq || (e.freq === bestFreq && e.lastUsed < bestLast)) {
          bestFreq = e.freq
          bestLast = e.lastUsed
          victim = key
        }
      }
  
      if (victim != null) cache.delete(victim)
      return
    }
  
    const meta = collectMeta(cache)
    const victim = mode.pickKey(meta)
    cache.delete(victim)
  }
  
  function pruneExpired<V>(
    cache: Map<string, Entry<V>>,
    ttlMs: number | undefined,
    now: number
  ): void {
    if (!ttlMs) return
  
    const stale: string[] = []
    for (const [key, e] of cache) {
      if (now - e.createdAt > ttlMs) stale.push(key)
    }
    for (const key of stale) cache.delete(key)
  }
  
  function maybeEvictForCapacity<V>(
    cache: Map<string, Entry<V>>,
    maxSize: number | undefined,
    eviction: EvictionMode | undefined
  ): void {
    if (maxSize == null || cache.size < maxSize) return
  
    while (cache.size >= maxSize) {
      evictOne(cache, eviction)
    }
  }
  
  function resolveEviction(eviction: MemoizeOptions['eviction']): EvictionMode | undefined {
    if (eviction === undefined) return 'lru'
    return eviction
  }
  
  export function memoize<TArgs extends unknown[], R>(
    fn: (...args: TArgs) => R,
    options: MemoizeOptions = {}
  ): (...args: TArgs) => R {
    const cache = new Map<string, Entry<R>>()
    const serialize = options.serializeArgs ?? defaultSerialize
    const maxSize = options.maxSize
    const eviction = resolveEviction(options.eviction)
    const ttlMs = options.ttlMs
  
    return (...args: TArgs): R => {
      const key = serialize(args as unknown[])
      const now = Date.now()
  
      pruneExpired(cache, ttlMs, now)
  
      let entry = cache.get(key)
  
      if (entry && ttlMs && now - entry.createdAt > ttlMs) {
        cache.delete(key)
        entry = undefined
      }
  
      if (entry) {
        cache.delete(key)
        entry.lastUsed = now
        entry.freq += 1
        cache.set(key, entry)
        return entry.value
      }
  
      maybeEvictForCapacity(cache, maxSize, eviction)
  
      const value = fn(...args)
  
      cache.set(key, {
        value,
        lastUsed: now,
        freq: 1,
        createdAt: now
      })
  
      return value
    }
  }
  
  function moveToMru<V>(cache: Map<string, Entry<V>>, key: string): void {
    const e = cache.get(key)
    if (!e) return
    cache.delete(key)
    cache.set(key, e)
  }
  
  export function memoizeAsync<TArgs extends unknown[], R>(
    fn: (...args: TArgs) => Promise<R>,
    options: MemoizeOptions = {}
  ): (...args: TArgs) => Promise<R> {
    const cache = new Map<string, Entry<Promise<R>>>()
    const serialize = options.serializeArgs ?? defaultSerialize
    const maxSize = options.maxSize
    const eviction = resolveEviction(options.eviction)
    const ttlMs = options.ttlMs
  
    return (...args: TArgs): Promise<R> => {
      const key = serialize(args as unknown[])
      const now = Date.now()
  
      pruneExpired(cache, ttlMs, now)
  
      let entry = cache.get(key)
  
      if (entry && ttlMs && now - entry.createdAt > ttlMs) {
        cache.delete(key)
        entry = undefined
      }
  
      if (entry) {
        cache.delete(key)
        entry.lastUsed = now
        entry.freq += 1
        cache.set(key, entry)
        return entry.value
      }
  
      maybeEvictForCapacity(cache, maxSize, eviction)
  
      const promise = fn(...args)
  
      cache.set(key, {
        value: promise,
        lastUsed: now,
        freq: 1,
        createdAt: now
      })
  
      return promise
    }
  }
  