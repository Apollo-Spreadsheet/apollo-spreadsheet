export interface NestedRowsApi {
  toggleRowExpand(id: string): void
  isRowExpanded(id: string): boolean
  getExpandedRows(): string[]
  getRowDepth(id: string): number
}
