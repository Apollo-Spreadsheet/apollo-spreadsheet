import React, {
	useState,
	useRef,
	useEffect,
	useCallback,
	useImperativeHandle,
	forwardRef,
	useMemo,
} from 'react'
import { createPortal } from 'react-dom'
import { Grid, WindowScroller } from 'react-virtualized'
import { debounce } from 'lodash'
import { makeStyles } from '@material-ui/core/styles'
import { StretchMode } from '../types/stretch-mode.enum'
import { GridApi } from '../types/grid-api.type'
import { HorizontalScrollProps, ScrollHandlerRef, HeaderGridRef } from './horizontalScrollProps'

//Time to wait before set non scrolling state
const RESET_SCROLLING_STATE_DEBOUNCE_TIME = 100
//Time to wait before recompute the grid
const RECOMPUTE_DEBOUNCE_TIME = 1000

const useStyles = makeStyles(() => ({
	scrollContent: {
		height: '10px',
	},
	root: {
		overflowX: 'hidden',
		minHeight: '10px',
		'&::-webkit-scrollbar-track': {
			borderRadius: '10px',
			opacity: 0.5,
			'-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,.3)',
		},
		'&::-webkit-scrollbar': {
			// width: `px`,
			height: '5px',
			opacity: 0.5,
		},
		'&::-webkit-scrollbar-thumb': {
			borderRadius: '10px',
			opacity: 0.5,
			'-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,.3)',
		},
		'&:hover': {
			overflowX: 'auto',
		},
	},
}))

/**
 * Component responsible for handling the horizontal scroll using a fake scroll technique
 * and sticking on the bottom if necessary
 * Only handles the scrollLeft because react-virtualized handles scrollTop for us
 * @todo Requires a major refactor, check git issue
 */
const HorizontalScroll = forwardRef(
	(
		{ children, scrollContainer, width, totalColumnWidth }: HorizontalScrollProps,
		componentRef: React.Ref<ScrollHandlerRef>,
	) => {
		const scrollChildRef = useRef<HTMLDivElement | null>(null)
		const headerRef = useRef<HeaderGridRef | null>(null)
		const gridRef = useRef<GridApi | null>(null)
		const fakeScrollerRef = useRef<HTMLDivElement | null>(null)
		const [stickyScroller, setStickyScroller] = useState(true)
		const [scrollLeft, setScrollLeft] = useState(0)
		const [scrolling, setScrolling] = useState(false)
		const classes = useStyles()

		// exposing api for resetting
		useImperativeHandle(componentRef, () => ({
			recompute: () => {
				setScrollLeft(0)
				setScrolling(false)
			},
			forceUpdate: () => {
				if (!headerRef.current || !gridRef.current) {
					return
				}
				headerRef.current.forceUpdate()
				gridRef.current.forceUpdate()
			},
		}))

		// updating fake scroller if scrolled on grid body
		useEffect(() => {
			if (!fakeScrollerRef.current || fakeScrollerRef.current.scrollLeft === scrollLeft) {
				return
			}

			fakeScrollerRef.current.scrollLeft = scrollLeft
		})

		// update sticky status of fake scroller on each update if not scrolling
		useEffect(() => {
			if (!scrollChildRef.current || scrolling) {
				return
			}

			const clientRect = scrollChildRef.current.getBoundingClientRect()

			setStickyScroller(clientRect.bottom > window.innerHeight)
		})

		// reset scrolling flag when scroll stops
		const setNotScrolling = useCallback(
			debounce(() => {
				setScrolling(false)
			}, RESET_SCROLLING_STATE_DEBOUNCE_TIME),
			[],
		)

		const handleScroll = useCallback(
			({ scrollLeft: paramScrollLeft }) => {
				//Prevent a re-render when the target scroll left hasn't change
				if (scrollLeft === paramScrollLeft) {
					return
				}
				setScrollLeft(paramScrollLeft)
				setScrolling(true)
				setNotScrolling()
			},
			[scrollLeft],
		)

		// call virtualized recompute when window scroller detects resize
		const onResize = useCallback(
			debounce(() => {
				headerRef.current?.recomputeGridSize()
				gridRef.current?.recomputeGridSize()
			}, RECOMPUTE_DEBOUNCE_TIME),
			[],
		)

		// Checks the stretch mode and also the total column width vs actual container width
		const displayHorizontalScroll = useMemo(() => {
			return totalColumnWidth > width
		}, [width, totalColumnWidth])

		return children({
			height: 400,
			isScrolling: false,
			scrollTop: 0,
			scrollLeft: 0,
			headerRef,
			gridRef,
		})
		// return (
		// 	<>
		// 		<WindowScroller scrollElement={scrollContainer || window} onResize={onResize}>
		// 			{({ height, isScrolling, scrollTop, registerChild }) => (
		// 				<div
		// 					ref={ref => {
		// 						scrollChildRef.current = ref
		// 						registerChild(ref)
		// 					}}
		// 				>
		// 					{children({
		// 						height,
		// 						isScrolling: isScrolling || scrolling,
		// 						scrollTop,
		// 						scrollLeft,
		// 						headerRef,
		// 						gridRef,
		// 					})}
		// 					{displayHorizontalScroll && (
		// 						<div
		// 							id="fake-scroller"
		// 							className={classes.root}
		// 							style={{
		// 								width,
		// 								position: stickyScroller ? 'sticky' : 'relative',
		// 								bottom: stickyScroller ? '0px' : 'unset',
		// 							}}
		// 							onScroll={e => {
		// 								handleScroll({ scrollLeft: e.target['scrollLeft'] })
		// 							}}
		// 							ref={fakeScrollerRef}
		// 						>
		// 							<div
		// 								id="fake-scroller-content"
		// 								className={classes.scrollContent}
		// 								style={{ width: totalColumnWidth }}
		// 							/>
		// 						</div>
		// 					)}
		// 				</div>
		// 			)}
		// 		</WindowScroller>
		// 		{displayHorizontalScroll &&
		// 			createPortal(
		// 				// added to prevent the lag issue between header and body scroll
		// 				<canvas
		// 					style={{
		// 						position: 'absolute',
		// 						top: 0,
		// 						width: '100%',
		// 						height: '100%',
		// 						pointerEvents: 'none',
		// 					}}
		// 				/>,
		// 				document.body,
		// 			)}
		// 	</>
		// )
	},
)

export default HorizontalScroll
