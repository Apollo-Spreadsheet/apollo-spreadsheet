import * as React from 'react'
import AdapterDayjs from '@material-ui/lab/AdapterDayjs'
import LocalizationProvider from '@material-ui/lab/LocalizationProvider'
import StaticDatePicker from '@material-ui/lab/StaticDatePicker'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import { EditorProps } from '../editorProps'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { ClickAwayListener, Popper } from '@material-ui/core'
import dayjs from 'dayjs'
import { StaticDatePickerProps } from '@material-ui/lab/StaticDatePicker/StaticDatePicker'

const useStyles = makeStyles(() => ({
  root: {
    zIndex: 999,
  },
  calendarContainer: {
    border: 'none',
  },
}))

export const CalendarEditor = forwardRef(
  ({ apiRef, stopEditing, anchorRef, value, additionalProps }: EditorProps, componentRef) => {
    const classes = useStyles()
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
    const theme = apiRef.current.getTheme()
    const renderInput = useCallback(() => <div />, [])
    return (
      <ClickAwayListener onClickAway={onClickAway}>
        <Popper
          open
          id={'apollo-calendar'}
          anchorEl={anchorRef}
          placement={'right-start'}
          keepMounted={false}
          className={clsx(classes.root, theme?.editorContainerClass, additionalProps?.className)}
          modifiers={popperModifiers}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDatePicker
              {...(additionalProps?.componentProps as StaticDatePickerProps)}
              displayStaticWrapperAs="desktop"
              openTo="day"
              value={value}
              onChange={onChange}
              renderInput={renderInput}
              allowKeyboardControl
              className={theme?.editorClass}
            />
          </LocalizationProvider>
        </Popper>
      </ClickAwayListener>
    )
  },
)
