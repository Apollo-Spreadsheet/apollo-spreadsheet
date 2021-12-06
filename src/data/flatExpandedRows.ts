import { Row } from '../types'
import { ApiRef } from '../api'

export const flatExpandedRows = (rows: Row[], apiRef: ApiRef): Row[] => {
  const flattenRows: Row[] = []
  rows.forEach(e => {
    if (
      e.__children &&
      e.__children.length > 0 &&
      apiRef.current.isRowExpanded(e[apiRef.current.selectionKey])
    ) {
      const flatten = flatExpandedRows(e.__children, apiRef)
      flattenRows.push(e)
      flattenRows.push(...flatten)
    } else {
      flattenRows.push(e)
    }
  })

  return flattenRows
}
