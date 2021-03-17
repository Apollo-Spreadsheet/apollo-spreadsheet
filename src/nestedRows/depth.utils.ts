import { Row } from '../types'

export function addDepth(arr: Row[], depth = 1) {
  const data = [...arr]
  data.forEach(obj => {
    // eslint-disable-next-line no-param-reassign
    obj.depth = depth
    if (obj.__children) {
      addDepth(obj.__children, depth + 1)
    }
  })
  return data
}

export function createDepthMap(rows: Row[], selectionKey: string, depth = 1, map = {}) {
  rows.forEach(e => {
    // eslint-disable-next-line no-param-reassign
    map[e[selectionKey]] = depth
    if (e.__children) {
      createDepthMap(e.__children, selectionKey, depth + 1, map)
    }
  })

  return map
}
