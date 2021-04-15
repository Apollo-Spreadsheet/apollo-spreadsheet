import { Column } from './column.types'

/**
 * Nested headers are additional headers bottom to top that only provide a "grouping" style but this
 * kind of headers do not affect the core of the grid nor provide any feature such as renderers
 * This headers follow its parent size and can only provide a few things and they have colSpan which allow
 * to create a bigger header
 */
export interface NestedHeader
  extends Pick<Column, 'tooltip' | 'className' | 'tooltipProps' | 'colSpan' | 'title'> {}
