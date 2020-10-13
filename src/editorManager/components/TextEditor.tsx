import React, {
	CSSProperties,
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'
import { Popover, TextField, TextareaAutosize, Fade, Grow } from '@material-ui/core'
import { NavigationKey } from '../enums/navigation-key.enum'
import { isCaretAtEndPosition } from '../utils/isCaretAtEndPosition'
import { EditorProps } from '../editorProps'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
	input: {
		width: '100%',
		height: '100%',
		resize: 'none',
		overflow: 'auto',
		border: 0,
		outline: 0,
		'&:focus': {
			border: 0,
			outline: 0,
		},
	},
}))
export const TextEditor = forwardRef(
	({ value, stopEditing, anchorRef, maxLength, validatorHook }: EditorProps, componentRef) => {
		const classes = useStyles()
		const [editingValue, setEditingValue] = useState(String(value))
		useImperativeHandle(
			componentRef,
			() => ({
				getValue: () => {
					return editingValue
				},
			}),
			[editingValue],
		)

		const isValidValue = useMemo(() => {
			if (!validatorHook) {
				return true
			}
			return validatorHook(editingValue)
		}, [editingValue])

		const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (NavigationKey[e.key]) {
				const cursorStart = e.target['selectionStart']
				const cursorEnd = e.target['selectionEnd']
				console.log({
					key: e.key,
					cursorStart,
					cursorEnd,
				})
				if (cursorStart === 0) {
					console.error('Cursor at start')
					e.preventDefault()
					stopEditing({ save: true, keyPress: NavigationKey[e.key] })
				}

				if (isCaretAtEndPosition(cursorEnd, e.target['value'].length)) {
					console.error('Cursor at end')
					e.preventDefault()
					stopEditing({ save: true, keyPress: NavigationKey[e.key] })
				}
				// console.log({
				// 	cursorStart,
				// 	cursorEnd,
				// 	textLength: e.target['value'].length,
				// 	isCaretAtEndPosition: isCaretAtEndPosition(cursorEnd, e.target['value'].length),
				// })
				//
				// const cartInEnd = isCaretAtEndPosition(cursorEnd, e.target['value'].length)
				// //Only navigate if we are in the end
				// if (!cartInEnd) {
				// 	return console.error("At end")
				// }
				//
				// //Check if caret is not yet trying to go negative or zero
				// if (cursorStart > 0 && cursorEnd > 0) {
				// 	return console.log("oh yea")
				// }
				//
				// e.preventDefault()
				// stopEditing({ save: true, keyPress: NavigationKey[e.key] })
			}
		}

		const onTextAreaResizeMount = useCallback((ref: HTMLTextAreaElement | null) => {
			if (!ref) {
				return
			}
			ref.selectionStart = editingValue.length
			ref.selectionEnd = editingValue.length
		}, [])

		console.log({ editingValue })
		const anchorStyle = anchorRef['style'] as CSSProperties
		return (
			<Popover
				id={'editor-portal'}
				anchorEl={anchorRef}
				open
				elevation={0}
				TransitionProps={{ timeout: 0 }}
				onClose={(event, reason) => {
					//Only allow to cancel if its invalid
					if (!isValidValue) {
						return stopEditing({ save: false })
					}

					if (reason === 'backdropClick') {
						return stopEditing({ save: true })
					}

					stopEditing({ save: false })
				}}
				marginThreshold={10}
				disableRestoreFocus
				PaperProps={{
					style: {
						overflow: 'hidden',
						zIndex: 10,
						border: isValidValue ? anchorStyle.border : '1px solid red',
						borderRadius: 0,
					},
				}}
			>
				<div
					id="editor-container"
					style={{
						width: anchorStyle.width,
						minHeight: anchorStyle.height,
					}}
				>
					<TextareaAutosize
						id={'apollo-textarea'}
						value={editingValue}
						ref={onTextAreaResizeMount}
						onChange={e => setEditingValue(e.target['value'])}
						autoFocus
						onKeyDown={onKeyDown}
						aria-label="text apollo editor"
						rowsMin={1}
						maxLength={maxLength}
						className={classes.input}
					/>
				</div>
			</Popover>
		)
	},
)

export default TextEditor
