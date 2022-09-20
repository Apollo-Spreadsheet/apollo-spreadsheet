import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { TextareaAutosize, Theme } from '@mui/material'
import { EditorProps } from '../editorProps'
import { handleEditorKeydown } from '../utils'
import clsx from 'clsx'
import { GRID_RESIZE, useApiEventHandler } from '../../api'
import EditorContainer from './EditorContainer'
import { createDefaultPaperProps } from './createDefaultPaperProps'
import styles from './styles.module.css'

export const TextEditor = forwardRef(
  (
    {
      value,
      stopEditing,
      anchorRef,
      maxLength,
      validatorHook,
      additionalProps,
      apiRef,
    }: EditorProps,
    componentRef,
  ) => {
    const [editingValue, setEditingValue] = useState(String(value))

    const onAnchorResize = useCallback(() => {
      stopEditing()
    }, [stopEditing])

    useApiEventHandler(apiRef, GRID_RESIZE, onAnchorResize)

    useImperativeHandle(
      componentRef,
      () => ({
        getValue: () => editingValue,
      }),
      [editingValue],
    )

    const isValidValue = useMemo(() => {
      if (!validatorHook) {
        return true
      }
      return validatorHook(editingValue)
    }, [editingValue, validatorHook])

    const onTextAreaResizeMount = useCallback((ref: HTMLTextAreaElement | null) => {
      if (!ref) {
        return
      }
      // eslint-disable-next-line no-param-reassign
      ref.selectionStart = ref.value.length
      // eslint-disable-next-line no-param-reassign
      ref.selectionEnd = ref.value.length
    }, [])

    const anchorStyle = anchorRef ? ((anchorRef as HTMLElement).style as CSSProperties) : {}

    const onEditorPortalClose = useCallback(
      (event: unknown, reason: 'backdropClick' | 'escapeKeyDown') => {
        //Only allow to cancel if its invalid
        if (!isValidValue) {
          return stopEditing({ save: false })
        }

        if (reason === 'backdropClick') {
          return stopEditing({ save: true })
        }

        stopEditing({ save: false })
      },
      [isValidValue, stopEditing],
    )

    const theme = apiRef.current.getTheme()
    const paperProps = createDefaultPaperProps(anchorStyle, isValidValue, additionalProps, theme)

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        handleEditorKeydown(e, stopEditing)
      },
      [stopEditing],
    )

    return (
      <EditorContainer anchorEl={anchorRef} PaperProps={paperProps} onClose={onEditorPortalClose}>
        <TextareaAutosize
          {...(additionalProps?.componentProps as React.HTMLAttributes<any>)}
          id={'apollo-textarea'}
          value={editingValue}
          ref={onTextAreaResizeMount}
          onChange={e => setEditingValue(e.target.value)}
          autoFocus
          onKeyDown={onKeyDown}
          aria-label="text apollo editor"
          minRows={1}
          maxLength={maxLength}
          className={clsx(styles.input, additionalProps?.className, theme?.editorClass)}
          style={additionalProps?.style}
        />
      </EditorContainer>
    )
  },
)

export default TextEditor
