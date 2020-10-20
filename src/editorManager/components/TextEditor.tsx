import React, {
	CSSProperties,
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react'
import { Popover, TextareaAutosize } from '@material-ui/core'
import { NavigationKey } from '../enums/navigation-key.enum'
import { isCaretAtEndPosition } from '../utils/isCaretAtEndPosition'
import { EditorProps } from '../editorProps'
import { makeStyles } from '@material-ui/core/styles'
import { addListener, removeListener } from 'resize-detector'
import { handleEditorKeydown } from "../utils/handleEditorKeydown"

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

		function onAnchorResize() {
			stopEditing()
		}

		//Watch for DOM Changes on the target anchor and close editor because Popover does not change
		useEffect(() => {
			addListener(anchorRef as any, onAnchorResize)
			return () => {
				removeListener(anchorRef as any, onAnchorResize)
			}
		}, [])

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


		const onTextAreaResizeMount = useCallback((ref: HTMLTextAreaElement | null) => {
			if (!ref) {
				return
			}
			ref.selectionStart = editingValue.length
			ref.selectionEnd = editingValue.length
		}, [])

		const anchorStyle = anchorRef['style'] as CSSProperties

		function onEditorPortalClose(event: unknown, reason: 'backdropClick' | 'escapeKeyDown') {
			//Only allow to cancel if its invalid
			if (!isValidValue) {
				return stopEditing({ save: false })
			}

			if (reason === 'backdropClick') {
				return stopEditing({ save: true })
			}

			stopEditing({ save: false })
		}

		return (
			<Popover
				id={'editor-portal'}
				anchorEl={anchorRef}
				open
				elevation={0}
				TransitionProps={{ timeout: 0 }}
				onClose={onEditorPortalClose}
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
						onKeyDown={e => handleEditorKeydown(e, stopEditing)}
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
