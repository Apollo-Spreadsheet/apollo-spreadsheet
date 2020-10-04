import React from 'react'

export interface CellRendererProps {}

export interface CellEditorProps {}

export type ICellRenderer = (cellProps: CellRendererProps) => React.ReactNode | JSX.Element
export type IHeaderRenderer = (column: Column) => React.ReactNode | JSX.Element
export type ICellEditor = (cellProps: CellEditorProps) => React.ReactNode | JSX.Element

export enum CellEditorType {
	TextArea,
	Numeric,
	Calendar,
}

export interface ValidationResult {
	valid: boolean
	/** @default Incorrect value **/
	errorMessage?: string
	/** @default false **/
	stopEditing?: boolean
}
export interface Column<Key = string, Metadata = Object> {
	id: Key
	title: string
	accessor: string
	tooltip?: string
	width?: React.ReactText
	className?: string
	readOnly?: boolean | Function
	/** @todo Types **/
	disableNavigation?: boolean | Function /** @todo Types **/
	/**
	 * Provide a given type to use an existing plugin editor or provide your functional editor
	 * @todo IF is readOnly by default we disabled this */
	editor?: CellEditorType | ICellEditor
	/**
	 * Provide this hook in order to validate the cell right before it saves.
	 * If the value returned is false then an error will be prompted in the cell
	 * @param value
	 */
	validatorHook?: (value: any) => ValidationResult
	/**
	 * Provide this hook in order to restrict which keyboard controls are allowed
	 * Keep in mind there are some reserved, so this keyboard values are only while editing
	 * *NOTE*: If you provide a custom editor, this hook will not run
	 * @param event
	 */
	editorKeyboardHook?: (event: KeyboardEvent) => boolean
	cellRenderer?: ICellRenderer
	renderer?: IHeaderRenderer
	metadata?: Metadata
	rowSpan?: number
	colSpan?: number
}

export type HeadersData = Array<Column[]> | Column[]
