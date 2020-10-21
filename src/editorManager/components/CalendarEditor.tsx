import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { EditorProps } from '../editorProps'
import { Popper } from '@material-ui/core'
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import dayjs from 'dayjs'
import { makeStyles } from '@material-ui/core/styles'
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
	root: {
		zIndex: 999
	},
	calendarContainer: {
		border: 'none',
	},
}))

export const CalendarEditor = forwardRef(
	({ stopEditing, anchorRef, value, additionalProps }: EditorProps, componentRef) => {
		const classes = useStyles()
		const [state, setState] = useState<{ value: dayjs.Dayjs; close: boolean }>({
			value: dayjs(value),
			close: false,
		})
		const popperPlacement = useRef<string>('right-start')

		useImperativeHandle(componentRef, () => ({
			getValue: () => {
				return dayjs(state.value).format('YYYY-MM-DD')
			},
		}))

		//Close state is a flag indicating whether to stop editing (for click event)
		useEffect(() => {
			if (state.close) {
				stopEditing({ save: true })
			}
		}, [state.close])

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Tab') {
				e.preventDefault()
				e.stopImmediatePropagation()
			}

			if (e.key === 'ArrowUp') {
				e.preventDefault()
				setState({ ...state, value: state.value.subtract(1, 'week') })
			}

			if (e.key === 'ArrowDown') {
				e.preventDefault()
				setState({ ...state, value: state.value.add(1, 'week') })
			}
			if (e.key === 'ArrowRight') {
				e.preventDefault()
				setState({ ...state, value: state.value.add(1, 'day') })
			}
			if (e.key === 'ArrowLeft') {
				e.preventDefault()
				setState({ ...state, value: state.value.subtract(1, 'day') })
			}

			if (e.key === 'Enter') {
				e.preventDefault()
				stopEditing({ save: true })
			}

			if (e.key === 'Escape') {
				e.preventDefault()
				stopEditing({ save: false })
			}

			//Re-use this for second arms, might be very useful
			// if (popperPlacement.current.startsWith('right') && e.key === 'ArrowRight') {
			// 	e.preventDefault()
			// 	e.stopImmediatePropagation()
			// }
			// if (popperPlacement.current.startsWith('left') && e.key === 'ArrowLeft') {
			// 	e.preventDefault()
			// 	e.stopImmediatePropagation()
			// }
			// if (popperPlacement.current.startsWith('right') && e.key === 'ArrowLeft') {
			// 	e.preventDefault()
			// 	e.stopImmediatePropagation()
			// 	stopEditing(true)
			// }
			// if (popperPlacement.current.startsWith('left') && e.key === 'ArrowRight') {
			// 	e.preventDefault()
			// 	e.stopImmediatePropagation()
			// 	stopEditing(true)
			// }
		}
		useEffect(() => {
			document.addEventListener('keydown', onKeyDown)
			return () => document.removeEventListener('keydown', onKeyDown)
		}, [state])

		return (
			<Popper open id={'apollo-calendar'} anchorEl={anchorRef} placement={'right-start'} className={clsx(classes.root, additionalProps?.className)}>
				<ReactDatePicker
					{...additionalProps?.componentProps as ReactDatePickerProps}
					id={'apollo-calendar'}
					autoFocus
					calendarClassName={classes.calendarContainer}
					showTimeInput={false}
					showPopperArrow={false}
					shouldCloseOnSelect={true}
					onClickOutside={() => stopEditing({ save: false })}
					onChange={(date: Date) => {
						setState({ value: dayjs(date), close: true })
					}}
					open
					inline
					selected={state.value.toDate()}
					dateFormat="yyyy/MM/dd"
				/>
			</Popper>
		)
	},
)
