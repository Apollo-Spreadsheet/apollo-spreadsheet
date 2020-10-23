import React from 'react'

export interface GridCell {
	colSpan?: number
	rowSpan?: number
	value: React.ReactText | JSX.Element
	style?: React.CSSProperties
	className?: string
	gridType?: 'body' | 'header'
	dummy?: boolean
	dummyFor?: 'colSpan' | 'rowSpan'
}
