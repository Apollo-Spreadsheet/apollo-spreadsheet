import { DisableSortFilterParam, GridWrapperCommonProps } from './gridWrapper'
import { GridContainerCommonProps } from './gridContainer'
import { GridTheme, Row, StretchMode } from './types'
import { KeyDownEventParams, NavigationCoords } from './navigation'
import { SelectionProps } from './rowSelection'
import { ApiRef } from './api/types'

export interface ApolloSpreadsheetProps extends GridWrapperCommonProps, GridContainerCommonProps {
	theme?: GridTheme
	/** @default { rowIndex: 0, colIndex: 0} **/
	defaultCoords?: NavigationCoords
	/**
	 * Main grid body (rows and cells) class name
	 */
	className?: string
	rows: Row[]
	/** @default 50 **/
	minRowHeight?: number
	/** @default 50 **/
	minColumnHeight?: number
	/** @default 30 **/
	minColumnWidth?: number
	/** @default StretchMode.None  */
	stretchMode?: StretchMode
	onKeyDown?: (params: KeyDownEventParams) => void
	selection?: SelectionProps
	onCreateRow?: (coords: NavigationCoords) => void
	/**
	 * Indicates if the sort is disabled globally or on a specific column
	 * @default true **/
	disableSort?: boolean | DisableSortFilterParam
	/**
	 * Providing a custom ApiRef will override internal ref by allowing the exposure of grid methods
	 */
	apiRef?: ApiRef
}
