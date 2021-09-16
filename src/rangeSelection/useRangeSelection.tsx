import { NavigationCoords, useKeyboard } from '../keyboard'
import { CSSProperties, useCallback, useRef, useState } from 'react'
import { ApolloCoreProps } from '../ApolloSpreadsheetProps'
import { RangeSelectionProps } from './rangeSelectionProps'
import { useLogger } from '../logger'
import { isFunctionType } from '../helpers'
import { useApiEventHandler } from '../api'
import { CellClickOrDoubleClickEventParams } from 'keyboard/types/cell-click-double-params'

interface Props extends Required<ApolloCoreProps>, Pick<RangeSelectionProps, 'defaultExpandedIds'> {
  enabled: boolean
  initialised: boolean
  defaultCoords: NavigationCoords
}

/**
 * This hook exposes utilities and methods to interact with rows children
 */
export function useRangeSelection({ apiRef, enabled, initialised, defaultCoords }: Props) {
  const logger = useLogger(useKeyboard.name)
  const coordsRef = useRef<NavigationCoords>(defaultCoords)
  const [coords, setCoords] = useState<NavigationCoords>(defaultCoords)
  const cellRangeSelection = useCallback(
    ({ colIndex, rowIndex }: NavigationCoords, force?: boolean) => {
      logger.debug(`Select cell for coordinates [${rowIndex},${colIndex}]`)
      if (colIndex === undefined || rowIndex === undefined) {
        return logger.error(
          `Undefined coordinates detected at selectCell [${rowIndex},${colIndex}]. If you wish to remove highlight, you can pass -1, -1 coordinates`,
        )
      }
      //Coordinates when the grid is clicked away
      if ((colIndex === -1 && rowIndex === -1) || force) {
        logger.debug('Force or negative -1 coordinates selected')
        coordsRef.current = { colIndex, rowIndex }
        apiRef.current.dispatchEvent('CELL_NAVIGATION_CHANGED', { coords: coordsRef.current })
        return setCoords({ colIndex, rowIndex })
      }

      //Equal selection comparison
      if (coords.colIndex === colIndex && coords.rowIndex === rowIndex) {
        return logger.debug('Coordinates given are equal to the current coordinates')
      }

      const column = apiRef.current.getColumnAt(colIndex)
      if (!column) {
        return logger.warn(
          `Column not found at index ${colIndex}, review your configuration. Total loaded columns ${apiRef.current.getColumnCount()}`,
        )
      }

      const isDisabled = isFunctionType(column.disableNavigation)
        ? column.disableNavigation({ rowIndex, colIndex })
        : column.disableNavigation

      if (isDisabled) {
        return logger.info(`Navigation is disabled for the given column: ${column.id}`)
      }

      //   coordsRef.current = { colIndex, rowIndex }
      //   apiRef.current.dispatchEvent('CELL_NAVIGATION_CHANGED', { coords: coordsRef.current })
      //   setCoords({ colIndex, rowIndex })
    },
    [apiRef, coords.colIndex, coords.rowIndex, logger],
  )
  //   const cellStyle: CSSProperties = { ...style }
  //   cellStyle.border = '1px solid #5984C2'
  //   cellStyle.backgroundColor = '#DFEDEC'
  //   cellStyle.color = '#5984C2'

  const onCellRangeSelect = useCallback(
    ({ event, colIndex, rowIndex }: CellClickOrDoubleClickEventParams) => {
      //console.log('keyboard select')
      event.preventDefault()
      cellRangeSelection({ rowIndex, colIndex }, false)
    },
    [cellRangeSelection],
  )

  useApiEventHandler(apiRef, 'RANGE_SELECTION', onCellRangeSelect)
}
