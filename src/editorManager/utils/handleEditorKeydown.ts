import { StopEditingParams } from '../useEditorManager'
import React from 'react'
import { NavigationKey } from '../enums'
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
		const cursorStart = (e.target as any).selectionStart
		const cursorEnd = (e.target as any).selectionEnd
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

		if (e.key === 'ArrowRight' && isCaretAtEndPosition(cursorEnd, (e.target as any).value.length)) {
			e.preventDefault()
			stopEditing({ save: true })
		}
	}
}
