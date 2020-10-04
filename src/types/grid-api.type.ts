import { NavigationCoords } from '../navigation/types/navigation-coords.type'

export interface IGridApi {
	recomputeGridSize: () => void
	forceUpdate: () => void
	getRowCount: () => number
	getRowsCount: () => number
	getRowAt: (index: number) => any | undefined
	getCellAt: (coords: NavigationCoords) => any | undefined
	getColumnAt: (index: number) => any | undefined
	getSelectedCell: () => NavigationCoords
	getActiveEditor: () => any
	isEditing: () => boolean
	selectedCell: (coords: NavigationCoords) => void
}
