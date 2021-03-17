import { Row } from '../types'

/** @todo Return the parentId rather than the index**/
export const getNestedRowParentIndex = (
  nestedRowId: string,
  selectionKey: string,
  rows: Row[],
): number => {
  // console.log({ nestedRowId, rows, selectionKey })
  for (let i = 0; i < rows.length; i++) {
    const e = rows[i]
    if (e.__children) {
      const found = e.__children.some(c => c[selectionKey] === nestedRowId)
      if (found) {
        return i
      }
      // console.log('Going a bit further')
      const nestedIndex = getNestedRowParentIndex(nestedRowId, selectionKey, e.__children)
      //console.log({ nestedIndex })
      if (nestedIndex !== -1) {
        return nestedIndex
      }
    }
  }

  return -1
}
