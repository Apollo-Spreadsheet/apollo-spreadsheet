import { StopEditingParams } from '../useEditorManager'
import React from 'react'
import { NavigationKey } from '../enums/navigation-key.enum'
import { isCaretAtEndPosition } from './isCaretAtEndPosition'

/**
 * Provides a generic keydown handler to check caret position and disabled navigation keys
 * @param e
 * @param stopEditing
 */
export function handleEditorKeydown(
	e: React.KeyboardEvent<unknown>,
	stopEditing: (params: StopEditingParams) => void,
) {
	if (NavigationKey[e.key]) {
		const cursorStart = e.target['selectionStart']
		const cursorEnd = e.target['selectionEnd']
		if (e.key === 'Tab') {
			e.preventDefault()
			stopEditing({ save: true })
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault()
			stopEditing({ save: true })
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault()
			stopEditing({ save: true })
		}

		if (e.key === 'ArrowLeft' && cursorStart === 0) {
			e.preventDefault()
			stopEditing({ save: true })
		}

		if (e.key === 'ArrowRight' && isCaretAtEndPosition(cursorEnd, e.target['value'].length)) {
			e.preventDefault()
			stopEditing({ save: true })
		}
	}
}
