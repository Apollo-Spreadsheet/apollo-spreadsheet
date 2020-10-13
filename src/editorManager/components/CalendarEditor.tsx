import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { EditorProps } from '../editorProps'
import { Popper } from '@material-ui/core'
import ReactDatePicker from 'react-datepicker'
import dayjs from 'dayjs'
import { makeStyles } from '@material-ui/core/styles'
import 'react-datepicker/dist/react-datepicker.css'
import { NavigationKey } from '../enums/navigation-key.enum'

/** @todo Inject via theme configuration **/
const useStyles = makeStyles(theme => ({
	calendarContainer: {
		border: 'none',
		color: theme.palette.type === 'dark' ? '#fff' : '#4d4d4d',
		backgroundColor: theme.palette.type === 'dark' ? '#121212' : '#fff',
		'& .react-datepicker__header': {
			backgroundColor: theme.palette.type === 'dark' ? '#121212' : '#fff',
		},
		'& .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header': {
			color: theme.palette.type === 'dark' ? '#fff' : '#47956A',
		},
		'& .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name': {
			color: theme.palette.type === 'dark' ? '#fff' : '#808080',
			borderRadius: '20px',
			'&:hover': {
				transform: 'scale(1.07)',
			},
		},
		'& .react-datepicker__day--disabled, .react-datepicker__month-text--disabled, .react-datepicker__quarter-text--disabled': {
			color: theme.palette.type === 'dark' ? 'black' : '#ccc',
			cursor: 'default',
		},
		'& .react-datepicker__day--selected ': {
			backgroundColor: '#77C698',
			color: '#fff',
			borderRadius: '20px',
		},
	},
}))

export const CalendarEditor = forwardRef(
	({ stopEditing, anchorRef, value }: EditorProps, componentRef) => {
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
			<Popper open id={'apollo-calendar'} anchorEl={anchorRef} placement={'right-start'}>
				<ReactDatePicker
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
					/** @todo Provide a editorProps on the column that can help limiting or providing extra validations **/
					// minDate={}
					selected={state.value.toDate()}
					dateFormat="yyyy/MM/dd"
				/>
			</Popper>
		)
	},
)
