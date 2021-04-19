export const ROW_SELECTION_CHANGE = 'ROW_SELECTION_CHANGE'
export const CELL_CLICK = 'CELL_CLICK'
export const CELL_DOUBLE_CLICK = 'CELL_DOUBLE_CLICK'
export const CELL_BEGIN_EDITING = 'CELL_BEGIN_EDITING'
export const CELL_STOP_EDITING = 'CELL_STOP_EDITING'
export const DATA_CHANGED = 'DATA_CHANGED'
export const ROWS_CHANGED = 'ROWS_CHANGED'
export const COLUMNS_CHANGED = 'COLUMNS_CHANGED'
export const GRID_RESIZE = 'GRID_RESIZE'
export const CELL_NAVIGATION_CHANGED = 'CELL_NAVIGATION_CHANGED'
export const COLLAPSES_CHANGED = 'COLLAPSES_CHANGED'
export const THEME_CHANGED = 'THEME_CHANGED'

/**
 * Returns the list of internal events that we should provide
 * Intellisense
 */
export const APOLLO_INTERNAL_EVENTS = [
  ROW_SELECTION_CHANGE,
  CELL_CLICK,
  CELL_DOUBLE_CLICK,
  CELL_BEGIN_EDITING,
  CELL_STOP_EDITING,
  DATA_CHANGED,
  ROWS_CHANGED,
  COLUMNS_CHANGED,
  GRID_RESIZE,
  CELL_NAVIGATION_CHANGED,
  COLLAPSES_CHANGED,
  THEME_CHANGED,
]

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer ElementType>
  ? ElementType
  : never

export type ApolloInternalEvents = ElementType<typeof APOLLO_INTERNAL_EVENTS>
