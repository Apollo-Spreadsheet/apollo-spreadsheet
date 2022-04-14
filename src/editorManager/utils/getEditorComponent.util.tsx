import TextEditor from '../components/TextEditor'
import { isFunctionType } from '../../helpers'
import { Column, ColumnCellType } from '../../columnGrid'
import { CalendarEditor, NumericEditor } from '../components'
import React from 'react'
import { Row } from '../../types'
import { EditorRef } from '../useEditorManager'
import { EditorProps } from '../editorProps'
import ReactIs from 'react-is'

/**
 * Creates the react element dynamically
 */
export const getEditorComponent = (
  row: Row,
  column: Column,
  editorProps: EditorProps,
  onRefMount: (ref: EditorRef) => void,
): JSX.Element | null => {
  // If any editor is passed we assume JSX.Element are returned
  // and that the ref is automatically attached
  if (column.editor) {
    // React-Is does not recognize correctly forward ref functions therefore we have our custom
    // handler for that
    const editorType = String((column.editor as any).$$typeof)
    const isForwardRefComponent = editorType.includes('react.forward_ref')
    if (isForwardRefComponent) {
      const forwardedEditor = column.editor as unknown as React.ForwardRefExoticComponent<any>
      return React.createElement(forwardedEditor, {
        ...editorProps,
        ref: onRefMount,
      })
    }

    //Check the type of this editor
    if (isFunctionType(column.editor)) {
      return column.editor({ row, column, onRefMount, editorProps })
    }

    return column.editor
  }

  // Handle all default forwardedRef components
  let EditorComponent: React.ForwardRefExoticComponent<any> = TextEditor

  if (column.type === ColumnCellType.Calendar) {
    EditorComponent = CalendarEditor
  } else if (column.type === ColumnCellType.Numeric) {
    EditorComponent = NumericEditor
  }

  return React.createElement(EditorComponent, { ...editorProps, ref: onRefMount })
}
