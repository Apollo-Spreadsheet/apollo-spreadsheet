import { NavigationKey } from './enums/navigation-key.enum'
import React, { CSSProperties } from 'react'
import { StopEditingParams } from './useEditorManager'
import { Header } from "../columnGrid/types"

export interface EditorProps {
	value: string
	stopEditing: (params?: StopEditingParams) => void
	anchorRef: Element
	additionalProps: Header['editorProps']
	maxLength: number
	validatorHook?: Header['validatorHook']
}
