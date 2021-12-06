import { Row } from '../types'
import { DepthMap } from './depth-map.interface'

/**
 * Recursively creates a map with the row ids -> depth level
 * @param rows
 * @param selectionKey
 * @param depth If provided will be used as the 0-th level depth
 * @param map   If a map is provided by default it will be mutated so make sure you create a
 * new copy of it in case you want to avoid mutation
 */
export const createDepthMap = (
  rows: Row[],
  selectionKey: string,
  depth = 1,
  map = {} as DepthMap,
): DepthMap => {
  rows.forEach(e => {
    const id = e[selectionKey]
    if (id) {
      // eslint-disable-next-line no-param-reassign
      map[id] = depth
      if (e.__children) {
        createDepthMap(e.__children, selectionKey, depth + 1, map)
      }
    }
  })

  return map
}
