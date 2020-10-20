import { BeginEditingParams, IEditorState, StopEditingParams } from "../../editorManager/useEditorManager"

export interface EditorManagerApi {
  /**
   * Begins editing in the given cell (if the given cell is not selected, we'll select the cell)
   * @param params
   */
  beginEditing: (params: BeginEditingParams) => void

  /**
   * Stops editing and saves if something has changed
   * @param params
   */
  stopEditing: (params?: StopEditingParams) => void

  /**
   * Returns the active editor state
   */
  getEditorState: () => IEditorState | null
}