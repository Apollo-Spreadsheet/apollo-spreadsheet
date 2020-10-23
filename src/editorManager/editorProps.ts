import { NavigationKey } from './enums/navigation-key.enum'
import React, { CSSProperties } from 'react'
import { StopEditingParams } from './useEditorManager'
import { Column } from '../columnGrid/types'

export interface EditorProps {
	value: string
	stopEditing: (params?: StopEditingParams) => void
	anchorRef: Element
	additionalProps: Column['editorProps']
	maxLength: number
	validatorHook?: Column['validatorHook']
}
