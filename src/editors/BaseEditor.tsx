import React, { CSSProperties, useState } from 'react'
import { Popover, TextField, TextareaAutosize } from '@material-ui/core'
import { NavigationKey } from './navigation-key.enum'
import { isCaretAtEndPosition } from './utils'

interface Props {
	value: string
	onCommit: (value: string, navigationKey?: NavigationKey) => void
	onCommitCancel: (navigationKey?: NavigationKey) => void
	anchorRef: Element
	cellStyle: CSSProperties
	maxHeight: number
	maxLength: number
	editor: any
}

/**
 * @todo Needs to be created
 * @param value
 * @param maxHeight
 * @param cellStyle
 * @param onCommit
 * @param onCommitCancel
 * @param anchorRef
 * @param maxLength
 * @param editor
 * @constructor
 */
export function BaseEditor({
	value,
	maxHeight,
	cellStyle,
	onCommit,
	onCommitCancel,
	anchorRef,
	maxLength,
	editor,
}: Props) {
	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' || NavigationKey[e.key]) {
			const cursorStart = e.target['selectionStart']
			const cursorEnd = e.target['selectionEnd']
			console.log({
				cursorStart,
				cursorEnd
			})
			if (e.key === NavigationKey.ArrowRight && !isCaretAtEndPosition(0, e.target['value'].length)) {
				return console.log('Not in the end so')
			}
			e.preventDefault()
			const newValue = e.target['value']
			if (newValue !== value) {
				return onCommit(newValue, NavigationKey[e.key])
			}
			return onCommitCancel(NavigationKey[e.key])
		}
	}

	return (
		<Popover
			anchorEl={anchorRef}
			open
			onClose={onCommitCancel}
			anchorOrigin={{
				vertical: 'center',
				horizontal: 'center',
			}}
			transformOrigin={{
				vertical: 'center',
				horizontal: 'center',
			}}>
			<div style={{ width: cellStyle.width, height: maxHeight }}>
				{editor(value, onKeyDown, maxLength)}
			</div>
		</Popover>
	)
}

export default BaseEditor
