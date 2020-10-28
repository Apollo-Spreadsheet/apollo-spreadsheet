import React from 'react'

export interface GridCell {
	colSpan?: number
	rowSpan?: number
	value: React.ReactText | JSX.Element | React.ReactNode
	style?: React.CSSProperties
	className?: string
	gridType?: 'body' | 'header'
	dummy?: boolean
	dummyFor?: 'colSpan' | 'rowSpan'
}
