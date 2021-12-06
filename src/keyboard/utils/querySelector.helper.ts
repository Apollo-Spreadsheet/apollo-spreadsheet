import { NavigationCoords } from '../types'

type CellQueryRole = 'columnheader' | 'cell'
interface CreateCellQueryProperties extends NavigationCoords {
  role: CellQueryRole
  accessor?: string
}

export interface CellQueryProperties {
  'aria-rowindex': number
  'aria-colindex': number
  'data-accessor'?: string
  role: CellQueryRole
}

export const createCellQueryProperties = ({
  colIndex,
  rowIndex,
  role,
  accessor,
}: CreateCellQueryProperties): CellQueryProperties => {
  const properties = {
    'aria-rowindex': rowIndex,
    'aria-colindex': colIndex,
    role,
  }
  if (accessor) {
    properties['data-accessor'] = accessor
  }
  return properties
}

export const createCellQuerySelector = ({ colIndex, rowIndex }: NavigationCoords) => {
  return `[aria-colindex="${colIndex}"][aria-rowindex="${rowIndex}"][role="cell"]`
}

export const createColumnQuerySelector = ({ colIndex, rowIndex }: NavigationCoords) => {
  return `[aria-colindex="${colIndex}"][aria-rowindex="${rowIndex}"][role="columnheader"]`
}

export const isCellElement = (element?: Element): boolean => {
  return element?.getAttribute('role') === 'cell'
}

/** @todo requires tests **/
export const getCellCoordinatesFromDOMElement = (target: Element): NavigationCoords | undefined => {
  const colIndex = target.getAttribute('aria-colindex')
  const rowIndex = target.getAttribute('aria-rowindex')
  if (!colIndex || !rowIndex) {
    return undefined
  }
  const parsedColIndex = Number(colIndex)
  const parsedRowIndex = Number(rowIndex)

  if (Number.isNaN(parsedRowIndex) || Number.isNaN(parsedColIndex)) {
    return undefined
  }

  if (parsedRowIndex < 0 || parsedColIndex < 0) {
    return undefined
  }

  return { colIndex: parsedColIndex, rowIndex: parsedRowIndex }
}

export const createSelectorElementNotFoundWarning = ({ colIndex, rowIndex }: NavigationCoords) => {
  return `Cell DOM element not found with coordinates [${rowIndex},${colIndex}]. Selector used: ${createCellQuerySelector(
    { colIndex, rowIndex },
  )}`
}

export const createCoordsParseWarning = (element?: Element): string => {
  return `Coordinates not extracted correctly from target ${element}, details: ${JSON.stringify({
    role: element?.getAttribute('role'),
    rowIndex: element?.getAttribute('aria-rowindex'),
    colIndex: element?.getAttribute('aria-colindex'),
  })}`
}
