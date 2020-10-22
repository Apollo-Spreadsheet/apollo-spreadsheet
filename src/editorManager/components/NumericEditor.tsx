import React, {
	CSSProperties,
	forwardRef,
	useCallback, useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react'
import { EditorProps } from '../editorProps'
import { Popover, TextareaAutosize, TextField } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { addListener, removeListener } from 'resize-detector'
import { handleEditorKeydown } from "../utils/handleEditorKeydown"
import clsx from "clsx";

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

export const NumericEditor = forwardRef(
	({ value, stopEditing, anchorRef, maxLength, validatorHook, additionalProps }: EditorProps, componentRef) => {
		const classes = useStyles()
		const [editingValue, setEditingValue] = useState<string>(
			isNaN(Number(value)) ? '0' : String(value),
		)

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
					return editingValue === "" ? 0 : parseFloat(editingValue)
				},
			}),
			[editingValue],
		)
		const onKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			const regex = /^[0-9.,]+$/
			//Only 0-9 with dot and comma
			if (!regex.test(e.key)) {
				e.preventDefault()
				e.stopPropagation()
			}
		}

		const isValidValue = useMemo(() => {
			if (validatorHook) {
				return validatorHook(editingValue)
			}
			//Use default number validator
			return !isNaN(Number(editingValue))
		}, [editingValue])

		const onTextAreaResizeMount = useCallback((ref: HTMLTextAreaElement | null) => {
			if (!ref) {
				return
			}
			ref.selectionStart = editingValue.toString().length
			ref.selectionEnd = editingValue.toString().length
		}, [])

		function onEditorPortalClose(event: unknown, reason:'backdropClick' | 'escapeKeyDown') {
			//Only allow to cancel if its invalid
			if (!isValidValue) {
				return stopEditing({ save: false })
			}

			if (reason === 'backdropClick') {
				return stopEditing({ save: true })
			}

			stopEditing({ save: false })
		}

		const anchorStyle = anchorRef['style'] as CSSProperties
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
						background: anchorStyle.background,
						backgroundColor: anchorStyle.backgroundColor
					}}
				>
					<TextareaAutosize
						{...additionalProps?.componentProps as React.HTMLAttributes<any>}
						id={'apollo-textarea'}
						value={editingValue}
						ref={onTextAreaResizeMount}
						inputMode={'decimal'}
						onKeyPress={onKeyPress}
						onKeyDown={e => handleEditorKeydown(e, stopEditing)}
						onChange={e => {
							setEditingValue(e.target['value'].replace(',', '.'))
						}}
						autoFocus
						aria-label="numeric apollo editor"
						rowsMin={1}
						maxLength={maxLength}
						className={clsx(classes.input, additionalProps?.className)}
						style={additionalProps?.style}
					/>
				</div>
			</Popover>
		)
	},
)

export default NumericEditor
