import { Column } from './column.types'

export interface GridHeader extends Column {
  isNested: boolean
  gridType?: 'body' | 'header'
  dummy?: boolean
  dummyFor?: 'colSpan' | 'rowSpan'
}
