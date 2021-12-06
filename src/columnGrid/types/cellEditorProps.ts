import { Row } from '../../types'
import { EditorProps, EditorRef } from '../../editorManager'
import { Column } from './column.types'

export interface CellEditorProps<TRow = Row> {
  row: TRow
  column: Column
  editorProps: EditorProps
  /**
   * `useImperativeHandle` hook is required in order to fetch the value after the editor closes and so it should be passed to the editor manager
   * @param ref
   */
  onRefMount: (ref: EditorRef) => void
}
