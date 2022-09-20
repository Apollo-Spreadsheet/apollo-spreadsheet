import * as React from 'react'
import { EditorProps } from '../editorProps'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { ClickAwayListener, Popper } from '@mui/material'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/lab'

const root = {
  zIndex: 999,
}

export const CalendarEditor = forwardRef(
  ({ apiRef, stopEditing, anchorRef, value, additionalProps }: EditorProps, componentRef) => {
    const [state, setState] = useState<{ value: dayjs.Dayjs; close: boolean }>({
      value: value ? dayjs(value) : dayjs(),
      close: false,
    })

    useImperativeHandle(componentRef, () => ({
      getValue: () => dayjs(state.value).format('YYYY-MM-DD'),
    }))

    //Close state is a flag indicating whether to stop editing (for click event)
    useEffect(() => {
      if (state.close) {
        stopEditing({ save: true })
      }
    }, [state.close, stopEditing])

    const onClickAway = useCallback(() => {
      stopEditing({ save: false })
    }, [stopEditing])

    const onKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          stopEditing({ save: false })
        }
      },
      [stopEditing],
    )

    useEffect(() => {
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }, [onKeyDown])

    const onChange = useCallback(date => {
      setState({ value: dayjs(date), close: true })
    }, [])

    const popperModifiers = [
      {
        name: 'flip',
        enabled: true,
        options: {
          altBoundary: true,
          rootBoundary: 'document',
          padding: 8,
        },
      },
      {
        name: 'preventOverflow',
        enabled: true,
        options: {
          altAxis: true,
          altBoundary: true,
          tether: true,
          rootBoundary: document,
          padding: 8,
        },
      },
      {
        name: 'arrow',
        enabled: false,
      },
    ]
    const renderInput = useCallback(() => <div />, [])
    return (
      <ClickAwayListener onClickAway={onClickAway}>
        <Popper
          open
          id={'apollo-calendar'}
          anchorEl={anchorRef}
          placement={'right-start'}
          keepMounted={false}
          sx={root}
          modifiers={popperModifiers}
        >
          <DatePicker
            //{...additionalProps?.componentProps}
            //displayStaticWrapperAs="desktop"
            //openTo="day"
            value={value}
            onChange={onChange}
            renderInput={renderInput}
            className={additionalProps?.className}
            //allowKeyboardControl
          />
        </Popper>
      </ClickAwayListener>
    )
  },
)
