import { NavigationKey } from './enums/navigation-key.enum'
import React, { CSSProperties } from 'react'
import { StopEditingParams } from './useEditorManager'

export interface EditorProps {
	value: string
	stopEditing: (params?: StopEditingParams) => void
	anchorRef: Element
	cellStyle?: CSSProperties
	maxLength: number
	validatorHook?: (value: unknown) => boolean
}
