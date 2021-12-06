import { IconRenderer } from './icon-renderer.type'

export interface NestedColumnsProps {
  /**
   * In order to use __children attribute or any other feature related to nestedColumns this needs
   * to be enabled
   * NOTE: Sorting and filtering in Nested Columns is currently not supported.
   * @default false
   */
  nestedColumns?: boolean
  /**
   * Factor value for nested Column first column margin
   * The Column margin is calculated using the depth level multiplying by the nestedColumnMargin
   * @default 10 **/
  nestedColumnMargin?: number
  /**
   * Provides a custom renderer that returns the actual DOM element that controls
   * the toggling of the Column expansion
   * @default MUI Icons **/
  iconRenderer?: IconRenderer
  /**
   * Provides a list of Column ids that will expand by default
   * NOTE: There is no guarantee to expand nested children so make sure the parent is visible
   * or is sequentially set before the nested children
   * e.g: If id 2 is nested of id 1 then you need to pass [1,2] to ensure its parent is opened before
   *
   * @default [] **/
  defaultExpandedColumnsIds?: string[]
}
