import { formatCellValue } from './formatCellValue'
import { GridCell, insertDummyCells } from '../gridWrapper'
import { Checkbox } from '@material-ui/core'
import React from 'react'
import { Row } from '../types'
import { isFunctionType } from '../helpers'
import { ApolloCoreProps, ApolloDataProps, ApolloLayoutProps } from '../ApolloSpreadsheetProps'

interface CreateDataParams
  extends Pick<ApolloDataProps, 'rows'>,
    Required<ApolloCoreProps>,
    Pick<ApolloLayoutProps, 'selection'> {}

export function createData({ selection, apiRef, rows }: CreateDataParams) {
  const columns = apiRef.current.getColumns()

  /**
   * @todo Refactor this function to small function utilities in order to make it way organized
   */
  const cellsList: GridCell[][] = rows.reduce((list: GridCell[][], row: Row, rowIndex) => {
    const updatedList = [...list]

    //Creates the cells for the current row
    const cells = columns.reduce((_cells, column, colIndex) => {
      const isDummy = apiRef.current.isMerged({ rowIndex, colIndex })
      if (isDummy) {
        return _cells
      }

      const spanInfo = apiRef.current.getSpanProperties({ rowIndex, colIndex })
      const cellValue = row[column.accessor] !== undefined ? row[column.accessor] : ''
      const value = column.cellRenderer
        ? column.cellRenderer({ row, column })
        : formatCellValue(cellValue)

      _cells.push({
        colSpan: spanInfo?.colSpan,
        rowSpan: spanInfo?.rowSpan,
        value,
      })
      return _cells
    }, [] as GridCell[])

    if (selection) {
      const isSelectable = selection.canSelect ? selection.canSelect(row) : true
      if (isSelectable) {
        const selected = apiRef.current.isRowSelected(row[selection.key])
        //Bind the rowSelection
        cells[cells.length - 1] = {
          value: (
            <Checkbox
              className={
                isFunctionType(selection.checkboxClass)
                  ? selection.checkboxClass({ row, column: columns[columns.length - 1] })
                  : selection.checkboxClass
              }
              checked={selected}
              onClick={() => apiRef.current.selectRow(row[selection.key])}
            />
          ),
        }
      }
    }

    // if (nestedRowsEnabled && row.__children !== undefined) {
    //   const hasChildren = row.__children.length > 0
    //   const isExpanded = apiRef.current.isRowExpanded(rowIndex)
    //   if (hasChildren && isExpanded) {
    //     //We need to push into updatedList after the rowIndex and create the cells for this
    //     const createdCells = createData({
    //       selection,
    //       rows: row.__children,
    //       apiRef,
    //       nestedRowsEnabled,
    //       depth: currentDepth + 1
    //     })
    //
    //     createdCells.forEach((e, i) => {
    //       //The parent index is the root index plus the position of the child where we should insert
    //       childrenCells.push({
    //         parentIndex: rowIndex + i,
    //         cells: e
    //       })
    //     })
    //   }
    // }

    updatedList[rowIndex] = cells
    return updatedList
  }, [] as GridCell[][])

  //Add the children cells on the target destination
  // childrenCells.forEach(e => {
  //   const target = cellsList[e.parentIndex + 1]
  //   if (target) {
  //     cellsList.splice(e.parentIndex + 1, 0, e.cells)
  //   } else {
  //     cellsList[e.parentIndex + 1] = e.cells
  //   }
  // })

  return insertDummyCells(cellsList) as GridCell[][]
}
