import React from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import { ROW_SELECTION_HEADER_ID } from './useRowSelection'
import { SelectionProps } from './selectionProps'
import { Column } from '../columnGrid'

export const createSelectionColumn = (selection: SelectionProps): Column => ({
  colSpan: 1,
  id: ROW_SELECTION_HEADER_ID,
  title: '',
  className: selection?.className,
  renderer: () => (
    <Tooltip placement={'top'} title={selection.tooltipText ?? 'Click to delete the selected rows'}>
      <IconButton onClick={selection?.onHeaderIconClick}>
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  ),
  disableNavigation: selection.disableNavigation ?? false,
  accessor: ROW_SELECTION_HEADER_ID,
  width: selection?.width ?? '2%',
})
