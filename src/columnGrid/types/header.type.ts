import React, { CSSProperties } from 'react'
import { TooltipProps } from '@material-ui/core'
import { NavigationCoords } from '../../navigation/types'
import { EditorRef } from '../../editorManager'
import { PopperProps } from '@material-ui/core/Popper/Popper'
import { ReactDatePickerProps } from 'react-datepicker'
import { Row } from '../../types'

export interface CellRendererProps<TRow = Row> {
	row: TRow
	column: Column
}

export interface CellEditorProps<TRow = Row> {
	row: TRow
	column: Column
	/**
	 * useImperativeHandle is required internally so it should be passed into here the api ref
	 * @param ref
	 */
	onRefMount: (ref: EditorRef) => void
}

export type ICellRenderer = (cellProps: CellRendererProps) => React.ReactNode | JSX.Element
export type IHeaderRenderer = (column: Column) => React.ReactNode | JSX.Element
export type ICellEditor = (cellProps: CellEditorProps) => React.ReactNode | JSX.Element

export enum ColumnCellType {
	TextArea,
	Numeric,
	Calendar,
}

export interface IsReadOnlyCallback {
	(coords: NavigationCoords): boolean
}

export interface DisableNavigationFn {
	(coords: NavigationCoords): boolean
}

export interface Column<Key = string> {
	id: Key
	title: string
	accessor: string
	tooltip?: string
	tooltipProps?: {
		/** @default true **/
		arrow?: boolean
		/** @default false **/
		open?: boolean
		/** @default top **/
		placement?: TooltipProps['placement']
		PopperProps?: Partial<PopperProps>
	}
	/** @default 500 **/
	maxLength?: number
	width?: React.ReactText
	className?: string
	cellClassName?: string
	readOnly?: boolean | IsReadOnlyCallback
	/** @todo Types **/
	disableNavigation?: boolean | DisableNavigationFn
	/**
	 * Cell value type for this column (the values are formatted accordingly)
	 * NOTE: If you attempt to use the calendar editor
	 * you must `import 'react-datepicker/dist/react-datepicker.css'` on your application
	 * This does not come by default due to SSR frameworks such as Next.js,
	 * in order to support them we have to rely on the integration
	 * @default   Text and editor TextAreaEditor
	 */
	type?: ColumnCellType
	/**
	 * Provide a given type to use an existing plugin editor or provide your functional editor
	 * @default Returned by the cell column cell type
	 */
	editor?: ICellEditor
	/**
	 * Provide this hook in order to validate the cell right before it saves.
	 * If the value returned is false then an error will be prompted in the cell
	 * @param value
	 */
	validatorHook?: (value: unknown) => boolean
	/**
	 * Provide this hook in order to restrict which keyboard controls are allowed
	 * Keep in mind there are some reserved, so this keyboard values are only while editing
	 * *NOTE*: If you provide a custom editor, this hook will not run
	 * @param event
	 */
	editorKeyboardHook?: (event: KeyboardEvent) => boolean
	/**
	 * Provides additional props to the active editor of this column
	 */
	editorProps?: {
		className?: string
		style?: CSSProperties
		componentProps?: Partial<React.HTMLAttributes<HTMLInputElement>> | Partial<ReactDatePickerProps>
	}
	cellRenderer?: ICellRenderer
	renderer?: IHeaderRenderer
	colSpan?: number
	/**
	 * Forces to disable the backspace keydown on cells (travel like excel default behaviour)
	 * @default false
	 */
	disableBackspace?: boolean
	disableCellPaste?: boolean
	disableCellCut?: boolean
	/**
	 * Number of ms to open editor (used in second arms)
	 * @default undefined
	 */
	delayEditorOpen?: number
}

/**
 * Nested headers are additional headers bottom to top that only provide a "grouping" style but this
 * kind of headers do not affect the core of the grid nor provide any feature such as renderers
 * This headers follow its parent size and can only provide a few things and they have colSpan which allow
 * to create a bigger header
 */
export interface NestedHeader {
	title: string
	tooltip?: string
	className?: string
	tooltipProps?: {
		/** @default true **/
		arrow?: boolean
		/** @default false **/
		open?: boolean
		/** @default top **/
		placement?: TooltipProps['placement']
	}
	colSpan?: number
}

export interface GridHeader extends Column {
	colSpan: number
	isNested: boolean
	gridType?: 'body' | 'header'
	dummy?: boolean
	dummyFor?: 'colSpan' | 'rowSpan'
}
