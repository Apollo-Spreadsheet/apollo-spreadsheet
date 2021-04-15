import { Column } from '../types'

export const createColumnMock = (column?: Partial<Column>) =>
  ({
    id: `column - ${Math.random()}`,
    accessor: column?.accessor ?? `access-${Math.random()}`,
    ...column,
  } as Column)
