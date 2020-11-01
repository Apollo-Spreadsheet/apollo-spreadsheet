import React from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import { ROW_SELECTION_HEADER_ID } from './useRowSelection'
import { SelectionProps } from './selectionProps'

export const createSelectionColumn = (selection: SelectionProps) => ({
	colSpan: 1,
	id: ROW_SELECTION_HEADER_ID,
	title: '',
	className: selection?.className,
	renderer: () => (
		<Tooltip placement={'top'} title={'Click to delete the selected rows'}>
			<IconButton onClick={selection?.onHeaderIconClick}>
				<DeleteIcon />
			</IconButton>
		</Tooltip>
	),
	accessor: ROW_SELECTION_HEADER_ID,
	width: selection?.width ?? '2%',
})
