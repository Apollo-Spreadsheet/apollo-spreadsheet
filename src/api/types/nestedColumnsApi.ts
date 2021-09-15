export interface NestedColumnsApi {
  toggleColumnExpand(id: string): void
  isColumnExpanded(id: string): boolean
  getExpandedColumns(): string[]
  getColumnDepth(id: string): number
}
