import React, { CSSProperties } from 'react'
import { TooltipProps } from '@material-ui/core'
import { NavigationCoords } from '../../keyboard'
import { PopperProps } from '@material-ui/core/Popper/Popper'
import { ReactDatePickerProps } from 'react-datepicker'
import { Row, DynamicCallback } from '../../types'
import { ApiRef } from '../../api'
import { CellEditorProps } from './cellEditorProps'

export interface CellRendererProps<TRow = Row> {
  row: TRow
  column: Column
}

/**
 * Provides custom props to the dynamic header/column renderer
 */
export interface ColumnRendererProps<Key = string, Metadata = any> {
  column: Column<Key, Metadata>
  apiRef: ApiRef
  columnIndex: number
  /**
   * This the final className for this content
   */
  className: string
}

export type CellRenderer = (cellProps: CellRendererProps) => JSX.Element
export type HeaderRenderer<Key = string, Metadata = any> = (
  column: ColumnRendererProps<Key, Metadata>,
) => JSX.Element

export type EditorReactComponent = JSX.Element | React.ForwardRefExoticComponent<any>
export type EditorFactory = (cellProps: CellEditorProps) => JSX.Element
export type ICellEditor = EditorReactComponent | EditorFactory

/**
 * @deprecated Must be removed soon in factor or specifying the editor
 * and cell renderer rather than a type
 * e.g: NumericCellRender which will format and do whatever it needs
 * and NumericEditor which will be the inline editor
 */
export enum ColumnCellType {
  TextArea,
  Numeric,
  Calendar,
}

export type ReadOnlyCallback = (coords: NavigationCoords) => boolean
export type ReadOnly = boolean | ReadOnlyCallback

export type DisableNavigationCallback = (coords: NavigationCoords) => boolean
export type DisableNavigation = boolean | DisableNavigationCallback

export interface ComponentPropsFn<TRow = Row> {
  (row: TRow, column: Column):
    | Partial<React.HTMLAttributes<HTMLInputElement>>
    | Partial<ReactDatePickerProps>
}

interface ColumnTooltipProps {
  /** @default true **/
  arrow?: boolean
  /** @default false **/
  open?: boolean
  /** @default top **/
  placement?: TooltipProps['placement']
  PopperProps?: Partial<PopperProps>
}

interface ShouldSaveHookMiddleware<T = any> {
  (currentValue: T, newValue: T): boolean
}

interface ValidatorHook<T = any> {
  (value: T): boolean
}

interface KeyboardHookCallback {
  (event: KeyboardEvent): boolean
}

/**
 * @todo Must be reviewed
 */
interface ColumnEditorProps {
  className?: string
  style?: CSSProperties
  componentProps?:
    | Partial<React.HTMLAttributes<HTMLInputElement>>
    | Partial<ReactDatePickerProps>
    | ComponentPropsFn
}

/**
 * `Column` definition will delegate some effects over `ApolloSpreadsheet` whether
 * you are creating a table, grid or spreadsheet
 */
export interface Column<Key = string, Metadata = any> {
  id: Key
  title: string
  accessor: string
  tooltip?: string
  style?: CSSProperties
  /**
   * Whether to hide this column (Might be useful for conditional rendering)
   * @default false
   */
  hide?: boolean
  tooltipProps?: ColumnTooltipProps
  /** @default 500 **/
  maxLength?: number
  width?: React.ReactText
  className?: string
  cellClassName?: string | DynamicCallback<Row, string>
  readOnly?: ReadOnly
  disableNavigation?: DisableNavigation
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
  validatorHook?: ValidatorHook
  /**
   * Invoked before dispatching onChange event after editing and expects to return whether
   * the grid send the new value or just drop it
   * @param value
   */
  shouldSaveHook?: ShouldSaveHookMiddleware
  /**
   * Provide this hook in order to restrict which keyboard controls are allowed
   * Keep in mind there are some reserved, so this keyboard values are only while editing
   * *NOTE*: If you provide a custom editor, this hook will not run
   * @param event
   */
  editorKeyboardHook?: KeyboardHookCallback
  /**
   * Provides additional props to the active editor of this column
   */
  editorProps?: ColumnEditorProps
  cellRenderer?: CellRenderer
  renderer?: HeaderRenderer
  colSpan?: number
  /**
   * Forces to disable the backspace keydown on cells (travel like excel default behaviour)
   * @default false
   */
  disableBackspace?: boolean | DynamicCallback<Row, boolean>
  disableCellPaste?: boolean | DynamicCallback<Row, boolean>
  disableCellCut?: boolean | DynamicCallback<Row, boolean>
  /**
   * Number of ms to open editor (used in second arms)
   * @default undefined
   */
  delayEditorOpen?: number
  /**
   * This property is useful when you want to attach some extra properties/information on a column that is not
   * going to interfere with Apollo
   */
  metadata?: Metadata
}
