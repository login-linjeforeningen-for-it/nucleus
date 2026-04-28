import { countryCentroidsEarly } from './geoCentroidsEarly'
import { countryCentroidsLate } from './geoCentroidsLate'

export type CountryCentroids = Record<string, [number, number]>

export const countryCentroids: CountryCentroids = {
    ...countryCentroidsEarly,
    ...countryCentroidsLate,
}
