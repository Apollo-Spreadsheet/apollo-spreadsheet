import { useCallback, useEffect, useRef } from 'react'
import { SelectionProps } from './selectionProps'
import { ApiRef, RowSelectionApi } from '../api/types'
import { useApiExtends, ROW_SELECTION_CHANGE } from '../api'
import { Row } from '../types'
import { useLogger } from '../logger'

export const ROW_SELECTION_HEADER_ID = '__selection__'

/**
 * useRowSelection is a hook that provides utility for selecting rows
 * @param rows
 * @param selection
 */
export function useRowSelection(apiRef: ApiRef, initialised: boolean, selection?: SelectionProps) {
	const logger = useLogger('useRowSelection')
	const selectedIds = useRef<string[]>([])

	//Detect if a row exists in selected but not in rows
	useEffect(() => {
		if (!selection) {
			logger.debug('Removing selection ids.')
			//Ensure cleanup because selection might have been disabled
			selectedIds.current = []
			apiRef.current.dispatchEvent(ROW_SELECTION_CHANGE)
		}
	}, [apiRef, selection, selectedIds, logger])

	const isRowSelected = useCallback((id: string) => selectedIds.current.some(e => e === id), [])

	const selectRow = useCallback(
		(idOrRow: string | Row) => {
			logger.debug(`Selecting row ${idOrRow.toString()}`)
			//Ensure selection is enabled
			if (!selection) {
				return
			}
			const _id = typeof idOrRow !== 'object' ? idOrRow : idOrRow[selection.key]
			//Find the target row in order to determinate whether we can select or not
			const targetRow = apiRef.current.getRowById(String(_id))
			if (!targetRow) {
				return logger.warn(
					`Row not found with the given key ${selection.key} on param: ${idOrRow} and extracted the id: ${_id}`,
				)
			}
			//If we do have the middleware and it returns false, just block
			if (selection.canSelect && !selection.canSelect(targetRow)) {
				return
			}

			//Check if highlight is at the selecting id otherwise we need to force it
			const rowIndex = apiRef.current.getRowIndex(String(_id))
			apiRef.current.selectCell({
				colIndex: apiRef.current.getColumnCount() - 1,
				rowIndex,
			})

			//Toggle effect
			if (!isRowSelected(_id)) {
				selectedIds.current = [...selectedIds.current, _id]
			} else {
				selectedIds.current = [...selectedIds.current.filter(e => e !== _id)]
			}

			apiRef.current.dispatchEvent(ROW_SELECTION_CHANGE)
		},
		[logger, selection, apiRef, isRowSelected],
	)

	const getSelectedRows = useCallback(() => {
		if (!selection) {
			return []
		}
		return apiRef.current
			.getRowsWithFilter(e =>
				selectedIds.current.some(id => String(id) === String(e[selection.key])),
			)
			.map((e: any) => String(e[selection.key]))
	}, [apiRef, selection])

	const rowSelectionApi: RowSelectionApi = {
		isRowSelected,
		selectRow,
		getSelectedRowIds: getSelectedRows,
	}

	useApiExtends(apiRef, rowSelectionApi, 'RowSelectionApi')

	return {
		isRowSelected,
		selectRow,
		getSelectedRows,
	}
}
