import TextEditor from '../components/TextEditor'
import { isFunctionType } from '../../helpers'
import { Column, ColumnCellType } from '../../columnGrid'
import { CalendarEditor, NumericEditor } from '../components'
import React from 'react'
import { Row } from '../../types'
import { EditorRef } from '../useEditorManager'
import { EditorProps } from '../editorProps'

/**
 * Creates the react element dynamically
 * @todo Tests must be created to ensure that either functions, references
 *  or whatever valid type render correctly
 */
export const getEditorComponent = (
  row: Row,
  column: Column,
  editorProps: EditorProps,
  onRefMount: (ref: EditorRef) => void,
): JSX.Element => {
  // If any editor is passed we assume JSX.Element are returned
  // and that the ref is automatically attached
  if (column.editor) {
    //Check the type of this editor
    if (isFunctionType(column.editor)) {
      return column.editor({ row, column, onRefMount, editorProps })
    }

    return column.editor
  }

  // Handle all default forwardedRef components
  let EditorComponent = TextEditor

  if (column.type === ColumnCellType.Calendar) {
    EditorComponent = CalendarEditor
  } else if (column.type === ColumnCellType.Numeric) {
    EditorComponent = NumericEditor
  }

  return React.createElement(EditorComponent, { ...editorProps, ref: onRefMount })
}
