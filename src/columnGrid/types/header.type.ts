import React from 'react'
import { TooltipProps } from '@material-ui/core'
import { NavigationCoords } from '../../navigation/types/navigation-coords.type'
import { EditorRef } from '../../editorManager/useEditorManager'

export interface CellRendererProps<TRow = unknown> {
	row: TRow
	column: Header
}

export interface CellEditorProps<TRow = unknown> {
	row: TRow
	column: Header
	/**
	 * useImperativeHandle is required internally so it should be passed into here the api ref
	 * @param ref
	 */
	onRefMount: (ref: EditorRef) => void
}

export type ICellRenderer = (cellProps: CellRendererProps) => React.ReactNode | JSX.Element
export type IHeaderRenderer = (column: Header) => React.ReactNode | JSX.Element
export type ICellEditor = (cellProps: CellEditorProps) => React.ReactNode | JSX.Element

export enum ColumnCellType {
	TextArea,
	Numeric,
	Calendar,
}

export interface IsReadOnlyCallback {
	(coords: NavigationCoords): boolean
}

export interface Header<Key = string> {
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
	}
	/** @default 500 **/
	maxLength?: number
	width?: React.ReactText
	className?: string
	readOnly?: boolean | IsReadOnlyCallback
	/** @todo Types **/
	disableNavigation?: boolean | Function /** @todo Types **/
	/**
	 * Cell value type for this column (the values are formatted accordingly)
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

export interface GridHeader extends Header {
	colSpan: number
	isNested: boolean
	/** @todo ParentRow has to be removed, not necessary anymore **/
	parentRow?: any
	gridType?: 'body' | 'header'
	dummy?: boolean
	dummyFor?: 'colSpan' | 'rowSpan'
}
