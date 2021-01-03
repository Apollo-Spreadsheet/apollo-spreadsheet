export interface GetColumnWidthArgs {
  index: number
}

/**
 * Returns the fixed/dynamic width of the given column index
 */
export interface GetColumnWidthFn {
  (args: GetColumnWidthArgs): number
}
