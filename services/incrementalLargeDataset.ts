import type { WeatherApiResponse } from '../types/weather'
import { setCachedFavoriteWeather } from './favoritesCache'
import { fetchWeatherById } from './weatherService'

/**
 * Task 6 — incremental processing: merge any AsyncIterable into fixed-size batches.
 * Містить лише поточний буфер розміру batchSize, а не усю колекцію джерела.
 */
export async function* batchAsyncIterable<T>(
  source: AsyncIterable<T>,
  batchSize: number
): AsyncGenerator<T[], void, undefined> {
  if (batchSize < 1) {
    throw new Error('batchSize must be >= 1')
  }

  let batch: T[] = []

  for await (const item of source) {
    batch.push(item)
    if (batch.length >= batchSize) {
      yield batch
      batch = []
    }
  }

  if (batch.length > 0) {
    yield batch
  }
}

/**
 * Віртуальне «велике» джерело: віддає total значень по одному без масиву довжини total (O(1) памʼять від розміру набору).
 * У реальному застосунку замість цього був би курсор БД або ReadableStream з файлу.
 */
export async function* asyncNumericIdSequence(
  total: number,
  seedId = 2643743
): AsyncGenerator<number, void, undefined> {
  for (let i = 0; i < total; i++) {
    yield seedId + (i % 997)
    if (i % 256 === 0 && i > 0) {
      await Promise.resolve()
    }
  }
}

/**
 * Приклад споживача потоку: зводить статистику лише в акумуляторах, без збереження всіх записів у памʼяті.
 */
export async function aggregateTempRangeFromWeatherBatches(
  batches: AsyncIterable<WeatherApiResponse[]>
): Promise<{ count: number; minTemp: number; maxTemp: number }> {
  let count = 0
  let minTemp = Infinity
  let maxTemp = -Infinity

  for await (const batch of batches) {
    for (const w of batch) {
      count++
      minTemp = Math.min(minTemp, w.main.temp)
      maxTemp = Math.max(maxTemp, w.main.temp)
    }
  }

  return {
    count,
    minTemp: count === 0 ? Number.NaN : minTemp,
    maxTemp: count === 0 ? Number.NaN : maxTemp
  }
}

/** Інкрементальне завантаження погоди: кожен yield — один шматок результатів (батч за батчем). */
export async function* fetchWeatherByIdBatchesFromIds(
  ids: AsyncIterable<number>,
  batchSize: number
): AsyncGenerator<WeatherApiResponse[], void, undefined> {
  for await (const idBatch of batchAsyncIterable(ids, batchSize)) {
    const out: WeatherApiResponse[] = []

    for (const id of idBatch) {
      try {
        out.push(await fetchWeatherById(id))
      } catch {
        /* мережева помилка / невалідний id */
      }
    }

    if (out.length > 0) {
      yield out
    }
  }
}

/**
 * Реальний сценарій: оновити кеш обраних міст батчами — обробили чанк, записали в AsyncStorage, посилання відпустили.
 */
export async function refreshFavoriteWeatherInStreamedBatches(
  favoriteCityIds: readonly number[],
  batchSize = 4
): Promise<{ batchesProcessed: number; rowsWritten: number }> {
  async function* ids(): AsyncGenerator<number, void, undefined> {
    for (const id of favoriteCityIds) {
      yield id
    }
  }

  let batchesProcessed = 0
  let rowsWritten = 0

  for await (const weatherChunk of fetchWeatherByIdBatchesFromIds(ids(), batchSize)) {
    batchesProcessed++
    for (const w of weatherChunk) {
      await setCachedFavoriteWeather(w.id, w)
      rowsWritten++
    }
  }

  return { batchesProcessed, rowsWritten }
}

/** Демо без мережі: лише ланцюг async iterator → batch → обробка чанка (наприклад для звіту в звіті). */
export async function demoVirtualDatasetPipeline(
  virtualTotal: number,
  batchSize: number
): Promise<{ batchesSeen: number; virtualRecords: number; checksum: number }> {
  let batchesSeen = 0
  let virtualRecords = 0
  let checksum = 0

  const pipeline = batchAsyncIterable(asyncNumericIdSequence(virtualTotal), batchSize)

  for await (const chunk of pipeline) {
    batchesSeen++
    for (const id of chunk) {
      virtualRecords++
      checksum = (checksum + id) % 1_000_003
    }
  }

  return { batchesSeen, virtualRecords, checksum }
}
