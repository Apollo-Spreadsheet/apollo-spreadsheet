import { StopEditingParams } from './useEditorManager'
import { Column } from '../columnGrid'
import { ApiRef } from '../api'

export interface EditorProps {
  value: string
  stopEditing: (params?: StopEditingParams) => void
  anchorRef: Element
  additionalProps: Column['editorProps']
  maxLength: number
  validatorHook?: Column['validatorHook']
  apiRef: ApiRef
}
