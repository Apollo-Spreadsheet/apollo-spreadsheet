import React from 'react'

export interface GridCell {
	colSpan?: number
	rowSpan?: number
	value: React.ReactText | JSX.Element
	style?: React.CSSProperties
	className?: string
	/** @todo ParentRow has to be removed, not necessary anymore **/
	parentRow?: any
	gridType?: 'body' | 'header'
	dummy?: boolean
	dummyFor?: 'colSpan' | 'rowSpan'
}
