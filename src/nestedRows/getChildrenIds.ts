import { Row } from '../types'

/**
 * Returns the ids from the row children recursively
 * @param row
 * @param selectionKey
 */
export const getChildrenIds = (row: Row, selectionKey: string): string[] => {
  const ids: string[] = []
  if (!row.__children || row.__children.length === 0) {
    return ids
  }

  row.__children.forEach(e => {
    if (e.__children) {
      const nestedIds = getChildrenIds(e, selectionKey)
      ids.push(e[selectionKey])
      ids.push(...nestedIds)
    } else {
      ids.push(e[selectionKey])
    }
  })
  return ids
}
