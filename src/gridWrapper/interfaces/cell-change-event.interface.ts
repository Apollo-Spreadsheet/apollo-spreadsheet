import { Row } from '../../types'
import { Column } from '../../columnGrid'
import { NavigationCoords } from '../../keyboard'

export interface CellChangeParams<T = Row, ValueType = unknown> {
  coords: NavigationCoords
  previousValue: ValueType
  newValue: ValueType
  row: T
  column: Column
}

export type CellChangeSource = 'backspace' | 'delete' | 'editor' | 'paste' | 'cut'

export type ICellChangeEvent<T = Row, ValueType = unknown> = (
  params: CellChangeParams<T, ValueType>,
  source: CellChangeSource,
) => void
