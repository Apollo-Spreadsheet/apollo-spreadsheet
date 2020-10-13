import { Header } from '../types/header.type'

export const createColumnMock = (column?: Partial<Header>) => {
	return {
		id: 'column - ' + Math.random(),
		accessor: column?.accessor ?? 'access-' + Math.random(),
		...column,
	} as Header
}
