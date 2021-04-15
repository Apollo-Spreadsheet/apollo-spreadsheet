import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ROW_SELECTION_HEADER_ID } from '../rowSelection'
import { NavigationCoords } from '../keyboard'
import { ColumnCellType, Column } from '../columnGrid'
import TextEditor from './components/TextEditor'
import NumericEditor from './components/NumericEditor'
import { EditorProps } from './editorProps'
import { CalendarEditor } from './components'
import { isFunctionType } from '../helpers'
import { useApiExtends, EditorManagerApi } from '../api'
import clsx from 'clsx'
import { useLogger } from '../logger'
import { Row } from '../types'
import valueEqual from 'value-equal'
import { ApolloCoreProps, ApolloCrudProps } from '../ApolloSpreadsheetProps'

export interface StopEditingParams {
  /** @default true **/
  save?: boolean
}

export interface IEditorState {
  node: JSX.Element
  rowIndex: number
  colIndex: number
  initialValue: React.ReactText
  targetElement: Element
  validatorHook?: Column['validatorHook']
  shouldSaveHook?: Column['shouldSaveHook']
  /**
   * Useful to prevent navigation interception on second arms
   */
  isPopup: boolean
}

export interface EditorManagerProps
  extends Required<ApolloCoreProps>,
    Pick<ApolloCrudProps, 'onCellChange'> {
  initialised: boolean
}

export interface BeginEditingParams {
  coords: NavigationCoords
  targetElement: Element
  defaultKey?: string
}

export interface EditorRef<T = any> {
  getValue: () => T
}

/**
 * Provides a way to manage the editors and also returns the active editor node
 * This hook controls the editing states, interacts with useNavigation hook and also manages the commit/cancel cycle of
 * an editor
 */
export function useEditorManager({ onCellChange, apiRef }: EditorManagerProps) {
  const logger = useLogger('useEditorManager')
  const editorRef = useRef<EditorRef | null>()
  const state = useRef<IEditorState | null>(null)
  const [editorNode, setEditorNode] = useState<JSX.Element | null>(null)

  /**
   * Closes the existing editor without saving anything
   */
  const stopEditing = useCallback(
    (params?: StopEditingParams) => {
      const editorState = state.current
      if (!editorState) {
        return
      }

      if ((params === undefined || params.save) && editorState) {
        const newValue = editorRef.current?.getValue() ?? undefined
        if (newValue === undefined) {
          state.current = null
          editorRef.current = null
          apiRef.current.dispatchEvent('CELL_STOP_EDITING', {
            colIndex: editorState.colIndex,
            rowIndex: editorState.rowIndex,
          })
          return setEditorNode(null)
        }

        const isValid = editorState.validatorHook?.(newValue) ?? true
        if (!isValid) {
          editorRef.current = null
          state.current = null
          apiRef.current.dispatchEvent('CELL_STOP_EDITING', {
            colIndex: editorState.colIndex,
            rowIndex: editorState.rowIndex,
          })
          return setEditorNode(null)
        }

        //Compare the values before dispatch
        if (!valueEqual(newValue, editorState.initialValue)) {
          //If we have the hook, invoke it before we proceed
          if (
            state.current?.shouldSaveHook &&
            !state.current.shouldSaveHook?.(editorState.initialValue, newValue)
          ) {
            editorRef.current = null
            state.current = null
            apiRef.current.dispatchEvent('CELL_STOP_EDITING', {
              colIndex: editorState.colIndex,
              rowIndex: editorState.rowIndex,
            })
            return setEditorNode(null)
          }
          const row = apiRef.current.getRowAt(editorState.rowIndex)
          const column = apiRef.current.getColumnAt(editorState.colIndex)
          if (!row) {
            logger.warn(
              `Row not found at ${editorState.rowIndex} when attempting to invoke onCellChange`,
            )
          } else if (!column) {
            logger.warn(
              `Column not found at ${editorState.colIndex} when attempting to invoke onCellChange`,
            )
          } else {
            onCellChange?.(
              {
                coords: {
                  rowIndex: editorState.rowIndex,
                  colIndex: editorState.colIndex,
                },
                previousValue: editorState.initialValue,
                newValue,
                row,
                column,
              },
              'editor',
            )
          }
        }
      }

      editorRef.current = null
      state.current = null
      apiRef.current.dispatchEvent('CELL_STOP_EDITING', {
        colIndex: editorState.colIndex,
        rowIndex: editorState.rowIndex,
      })
      setEditorNode(null)
    },
    [apiRef, logger, onCellChange],
  )

  //Detect if the active editing row/column has been deleted
  useEffect(() => {
    if (editorNode && state.current) {
      const target = apiRef.current.getRowAt(state.current.rowIndex)
      const column = apiRef.current.getColumnAt(state.current.colIndex)
      if (!target || !column) {
        stopEditing({ save: false })
      }
    }
  }, [apiRef, editorNode, stopEditing])

  const validateEditorRef = useCallback(
    (editorRef: EditorRef) => {
      if (!editorRef) {
        logger.warn(`
				useImperativeHandle is missing on the editor component OR has some misconfiguration. Editor reference is not defined therefore
				its not possible to start editing at the current cell. Please review your setup
			`)
        return false
      }
      if (!editorRef.getValue || !isFunctionType(editorRef.getValue)) {
        logger.warn(
          'Editor reference "getValue()" method is invalid, not a function or undefined, please review your setup',
        )
        return false
      }

      return true
    },
    [logger],
  )

  //Invoked when the editor mounts on DOM
  const onRefMount = useCallback(
    (ref: EditorRef) => {
      if (!ref) {
        return
      }
      validateEditorRef(ref)
      editorRef.current = ref
    },
    [validateEditorRef],
  )

  const getEditor = useCallback(
    (row: Row, column: Column, props: EditorProps) => {
      let EditorComponent: any = TextEditor
      if (column.editor) {
        EditorComponent = column.editor({ row, column, onRefMount, editorProps: props })
      } else if (column.type === ColumnCellType.Calendar) {
        EditorComponent = CalendarEditor
      } else if (column.type === ColumnCellType.Numeric) {
        EditorComponent = NumericEditor
      }

      return column.editor
        ? EditorComponent
        : React.createElement(EditorComponent, { ...props, ref: onRefMount })
    },
    [onRefMount],
  )

  /**
   * Starts editing in a given cell considering multiple configurations
   * @param   coords  NavigationCoords
   * @param   targetElement Element
   * @param   refresh Flag indicating whether we bypass or not the check for current editing. Use this carefully and only when you
   * want to reload the editor
   */
  const beginEditing = useCallback(
    ({ coords, targetElement, defaultKey }: BeginEditingParams) => {
      logger.debug(`Begin editing invoked for coords: [${coords.rowIndex},${coords.colIndex}]`)
      console.log({
        coords,
        targetElement,
        defaultKey,
      })
      //Validate if is editing but in the same coords
      if (
        state.current?.rowIndex === coords.rowIndex &&
        state.current?.colIndex === coords.colIndex
      ) {
        return
      }
      const column = apiRef.current.getColumnAt(coords.colIndex)
      if (!column) {
        return logger.warn(
          `Column not found at ${coords.colIndex}, therefore we can't start editing.`,
        )
      }

      if (column.id === ROW_SELECTION_HEADER_ID) {
        return
      }

      // eslint-disable-next-line no-nested-ternary
      const isReadOnly = column.readOnly
        ? typeof column.readOnly === 'function'
          ? column.readOnly(coords)
          : column.readOnly
        : false

      if (isReadOnly) {
        return
      }

      const row = apiRef.current.getRowAt(coords.rowIndex)
      if (!row) {
        return logger.warn(
          `Row not found at ${coords.rowIndex}, therefore we can't start editing at column: ${column.id}`,
        )
      }

      // If any valid key is pressed we override the existing text by default for the editor
      // eslint-disable-next-line no-nested-ternary
      const value = row[column.accessor] ? defaultKey || row[column.accessor] : defaultKey || ''

      const initialValue = row[column.accessor] ?? ''

      const editorProps: EditorProps = {
        anchorRef: targetElement,
        value,
        maxLength: column.maxLength ?? 500,
        additionalProps: {
          ...column.editorProps,
          className: clsx(apiRef.current.theme?.editorClass, column.editorProps?.className),
          componentProps:
            typeof column.editorProps?.componentProps === 'function'
              ? column.editorProps?.componentProps(row, column)
              : column.editorProps?.componentProps,
        },
        stopEditing,
        validatorHook: column.validatorHook,
        apiRef,
      }

      const editor = getEditor(row, column, editorProps)
      state.current = {
        node: editor,
        rowIndex: coords.rowIndex,
        colIndex: coords.colIndex,
        initialValue,
        targetElement,
        validatorHook: column.validatorHook,
        isPopup: column.editor !== undefined || column.type === ColumnCellType.Calendar,
        shouldSaveHook: column.shouldSaveHook,
      }

      setEditorNode(editor)
      apiRef.current.dispatchEvent('CELL_BEGIN_EDITING', coords)
    },
    [logger, apiRef, stopEditing, getEditor],
  )

  const getEditorState = useCallback(() => {
    return state.current
  }, [])

  const editorManagerApi: EditorManagerApi = {
    beginEditing,
    stopEditing,
    getEditorState,
  }
  useApiExtends(apiRef, editorManagerApi, 'EditorManagerApi')
  return editorNode
}
