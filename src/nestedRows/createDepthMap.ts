import { Row } from '../types'
import { DepthMap } from './depth-map.interface'

/**
 * Recursively creates a map with the row ids -> depth level
 * @param rows
 * @param selectionKey
 * @param depth
 * @param map
 */
export const createDepthMap = (
  rows: Row[],
  selectionKey: string,
  depth = 1,
  map = {} as DepthMap,
): DepthMap => {
  rows.forEach(e => {
    // eslint-disable-next-line no-param-reassign
    map[e[selectionKey]] = depth
    if (e.__children) {
      createDepthMap(e.__children, selectionKey, depth + 1, map)
    }
  })

  return map
}
