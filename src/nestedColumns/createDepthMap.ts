import { DepthMap } from './depth-map.interface'
import { Column } from 'columnGrid'

/**
 * Recursively creates a map with the column ids -> depth level
 * @param columns
 * @param selectionKey
 * @param depth If provided will be used as the 0-th level depth
 * @param map   If a map is provided by default it will be mutated so make sure you create a
 * new copy of it in case you want to avoid mutation
 */
export const createDepthMap = (
  columns: Column[],
  selectionKey: string,
  depth = 1,
  map = {} as DepthMap,
): DepthMap => {
  columns.forEach(e => {
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
