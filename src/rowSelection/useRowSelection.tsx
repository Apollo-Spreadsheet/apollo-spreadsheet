import React, { useCallback, useEffect, useState } from 'react'
import { SelectionProps } from './selectionProps'

export const ROW_SELECTION_HEADER_ID = '__selection__'

interface Props<TRow> {
	rows: TRow[]
	selection?: SelectionProps<TRow>
}

/**
 * useRowSelection is a hook that provides utility for selecting rows
 * @param rows
 * @param selection
 */
export function useRowSelection<TRow = any>({ rows, selection }: Props<TRow>) {
	const [selectedIds, setSelectedIds] = useState<string[]>([])
	//Detect if a row exists in selected but not in rows
	useEffect(() => {
		if (!selection) {
			//Ensure cleanup because selection might have been disabled
			if (selectedIds.length > 0) {
				setSelectedIds([])
			}
		}
	}, [rows, selection, selectedIds])

	const isRowSelected = useCallback(
		(id: string) => {
			return selectedIds.some(e => e === id)
		},
		[selectedIds],
	)

	const selectRow = useCallback(
		(idOrRow: string | TRow) => {
			//Ensure selection is enabled
			if (!selection) {
				return
			}

			const _id = typeof idOrRow === 'string' ? idOrRow : idOrRow[selection.key]
			//Find the target row in order to determinate whether we can select or not
			const targetRow = rows.find(e => String(e[selection.key]) === _id)
			if (!targetRow) {
				return
			}
			//If we do have the middleware and it returns false, just block
			if (selection.canSelect && !selection.canSelect(targetRow)) {
				return
			}

			//Toggle effect
			if (!isRowSelected(_id)) {
				setSelectedIds([...selectedIds, _id])
			} else {
				setSelectedIds(selectedIds.filter(e => e !== _id))
			}
		},
		[selectedIds, isRowSelected, selection, rows],
	)

	const getSelectedRows = useCallback(() => {
		if (!selection) {
			return []
		}
		return rows
			.filter(e => selectedIds.some(id => id === String(e[selection.key])))
			.map(e => String(e[selection.key]))
	}, [rows, selectedIds, selection])

	return {
		isRowSelected,
		selectRow,
		getSelectedRows,
	}
}
