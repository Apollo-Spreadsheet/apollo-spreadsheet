import { SortState } from '../../sort/useSort'

export interface SortApi {
  getSortState: () => SortState | null
  clearSort: () => void
  toggleSort: (columnId: string) => void
  sortColumn: (columnId: string, order: 'asc' | 'desc') => void
}
