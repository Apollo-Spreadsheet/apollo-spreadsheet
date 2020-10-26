import React from 'react'
import { OnScrollParams } from 'react-virtualized'
import { Column } from '../columnGrid/types'
import { StretchMode } from '../types'
import { ApiRef } from '../api/types'

export interface GridContainerChildrenProps {
	width: number
	height: number
	getColumnWidth: ({ index }: { index: number }) => number
	columnGridRef: React.MutableRefObject<any>
	mainGridRef: React.MutableRefObject<any>
	scrollLeft: number
	onScroll?: (params: OnScrollParams) => any
}

export interface GridContainerCommonProps {
	height?: React.ReactText
	width?: React.ReactText
	containerClassName?: string
}

export interface GridContainerProps extends GridContainerCommonProps {
	columns: Column[]
	minColumnWidth: number
	stretchMode: StretchMode
	children: (props: GridContainerChildrenProps) => unknown
	apiRef: ApiRef
}
