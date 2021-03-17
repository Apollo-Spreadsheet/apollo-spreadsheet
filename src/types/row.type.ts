/**
 * Represents the Row model as an object
 */
export interface Row {
  [key: string]: any
  /**
   * Provides nested rows that might be collapsed if
   * nestedRows option is enabled
   */
  __children?: Row[]
}
