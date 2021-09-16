export interface RangeSelectionProps {
  /**
   * In order to use any feature related to rangeSelection this needs to be enabled
   * @default false
   */
  rangeSelection?: boolean
  /**
   * Provides a list of row ids that will expand by default
   * NOTE: There is no guarantee to expand nested children so make sure the parent is visible
   * or is sequentially set before the nested children
   * e.g: If id 2 is nested of id 1 then you need to pass [1,2] to ensure its parent is opened before
   *
   * @default [] **/
  defaultExpandedIds?: string[]
}
