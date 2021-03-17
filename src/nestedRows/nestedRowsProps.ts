export interface NestedRowsProps {
  /**
   * In order to use __children attribute or any other feature related to nestedRows this needs
   * to be enabled
   * NOTE: Sorting and filtering in Nested rows is currently not supported.
   * @default false
   */
  nestedRows?: boolean
  /**
   * Factor value for nested row first column margin
   * The row margin is calculated using the depth level multiplying by the nestedRowMargin
   * @default 10 **/
  nestedRowMargin?: number
  /**
   * Provides a custom renderer that returns the actual DOM element that controls
   * the toggling of the row expansion
   * @default MUI Icons **/
  iconRenderer?: (toggle: () => void, isExpanded: boolean) => JSX.Element
  /**
   * Provides a list of row ids that will expand by default
   * NOTE: There is no guarantee to expand nested children so make sure the parent is visible
   * or is sequentially set before the nested children
   * e.g: If id 2 is nested of id 1 then you need to pass [1,2] to ensure its parent is opened before
   *
   * @default [] **/
  defaultExpandedIds?: string[]
  /**
   * @default false
   */
  disableCellPositionAdjustment?: boolean
}
