import { ApiRef } from '../api'
import { Column } from '../columnGrid'

export const flatExpandedColumns = (columns: Column[], apiRef: ApiRef): Column[] => {
  const flattenColumn: Column[] = []
  columns.forEach(e => {
    if (
      e.__children &&
      e.__children.length > 0 &&
      apiRef.current.isColumnExpanded(e[apiRef.current.selectionKey])
    ) {
      const flatten = flatExpandedColumns(e.__children, apiRef)
      flattenColumn.push(e)
      flattenColumn.push(...flatten)
    } else {
      flattenColumn.push(e)
    }
  })

  return flattenColumn
}
