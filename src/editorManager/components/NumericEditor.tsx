import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { EditorProps } from '../editorProps'
import { TextareaAutosize } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { handleEditorKeydown } from '../utils'
import clsx from 'clsx'
import { GRID_RESIZE, useApiEventHandler } from '../../api'
import { createDefaultPaperProps } from './createDefaultPaperProps'
import EditorContainer from './EditorContainer'

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
    const classes = useStyles()
    const [editingValue, setEditingValue] = useState<string>(
      isNaN(Number(value)) ? '0' : String(value),
    )

    const onAnchorResize = useCallback(() => {
      stopEditing()
    }, [stopEditing])

    useApiEventHandler(apiRef, GRID_RESIZE, onAnchorResize)

    useImperativeHandle(
      componentRef,
      () => ({
        getValue: () => (editingValue === '' ? 0 : parseFloat(editingValue)),
      }),
      [editingValue],
    )
    const onKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const regex = /^[0-9.,]+$/
      //Only 0-9 with dot and comma
      if (!regex.test(e.key)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }, [])

    const isValidValue = useMemo(() => {
      if (validatorHook) {
        return validatorHook(editingValue)
      }
      //Use default number validator
      return !isNaN(Number(editingValue))
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

    const anchorStyle = (anchorRef as any).style as CSSProperties
    const theme = apiRef.current.getTheme()
    const paperProps = createDefaultPaperProps(anchorStyle, isValidValue, additionalProps, theme)

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        handleEditorKeydown(e, stopEditing)
      },
      [stopEditing],
    )

    const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditingValue(e.target.value.replace(',', '.'))
    }, [])

    return (
      <EditorContainer anchorEl={anchorRef} onClose={onEditorPortalClose} PaperProps={paperProps}>
        <TextareaAutosize
          {...(additionalProps?.componentProps as React.HTMLAttributes<any>)}
          id={'apollo-textarea'}
          value={editingValue}
          ref={onTextAreaResizeMount}
          inputMode={'decimal'}
          onKeyPress={onKeyPress}
          onKeyDown={onKeyDown}
          onChange={onChange}
          autoFocus
          aria-label="numeric apollo editor"
          minRows={1}
          maxLength={maxLength}
          className={clsx(classes.input, additionalProps?.className)}
          style={additionalProps?.style}
        />
      </EditorContainer>
    )
  },
)

export default NumericEditor
