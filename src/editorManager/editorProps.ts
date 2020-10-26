import { StopEditingParams } from './useEditorManager'
import { Column } from '../columnGrid/types'
import { ApiRef } from '../api/types'

export interface EditorProps {
	value: string
	stopEditing: (params?: StopEditingParams) => void
	anchorRef: Element
	additionalProps: Column['editorProps']
	maxLength: number
	validatorHook?: Column['validatorHook']
	apiRef: ApiRef
}
