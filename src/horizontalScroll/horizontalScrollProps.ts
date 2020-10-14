import React from 'react'
import { GridApi } from '../types/grid-api.type'
import { StretchMode } from '../types/stretch-mode.enum'

export interface HeaderGridRef {
	forceUpdate: () => void
	recomputeGridSize: () => void
}

interface ScrollHandlerChildrenProps {
	height: number
	isScrolling: boolean
	scrollTop: number
	scrollLeft: number
	headerRef: React.MutableRefObject<HeaderGridRef | null>
	gridRef: React.MutableRefObject<GridApi | null>
}

export interface ScrollHandlerRef {
	recompute: () => void
	forceUpdate: () => void
}

export type ScrollHandlerChildrenFn = (props: ScrollHandlerChildrenProps) => void

export interface HorizontalScrollProps {
	//The total of columns width sum considering fixed widths already
	totalColumnWidth: number
	//Container width (actual size)
	width: number
	scrollContainer: Element | null
	children: ScrollHandlerChildrenFn
}
