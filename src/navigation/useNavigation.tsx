import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	isCtrlMetaKey,
	isIndexOutOfBoundaries,
	isMetaKey,
	isPrintableChar,
} from './navigation.utils'
import { ICellClickProps } from './types/cell-click-props.type'
import { NavigationCoords } from './types/navigation-coords.type'
import { OnCellClick } from './types/cell-click-event.type'
import { isFunctionType } from '../helpers/isFunction'
import { GetColumnAt } from '../columnGrid/useHeaders'
import { GridCell } from '../gridWrapper/interfaces/gridCell'
import {
	BeginEditingParams,
	CellChangeParams,
	IEditorState,
	StopEditingParams,
} from '../editorManager/useEditorManager'
import * as clipboardy from 'clipboardy'
import { ColumnCellType, Header } from '../columnGrid/types/header.type'
import dayjs from 'dayjs'
import { ROW_SELECTION_HEADER_ID } from '../rowSelection/useRowSelection'
import { debounce, DebouncedFunc } from 'lodash'
import { NavigationKey } from '../editorManager/enums/navigation-key.enum'

interface Props<TRow = unknown> {
	defaultCoords: NavigationCoords
	data: GridCell[][]
	columnCount: number
	rows: TRow[]
	suppressControls: boolean
	getColumnAt: GetColumnAt
	beginEditing: (params: BeginEditingParams) => void
	stopEditing: (params?: StopEditingParams) => void
	onCellChange?: (params: CellChangeParams) => void
	editorState: IEditorState | null
	selectRow: (id: string | TRow) => void
	onCreateRow?: (coords: NavigationCoords) => void
}

export type SelectCellFn = (params: NavigationCoords) => void

export interface KeyDownEventParams {
	event: KeyboardEvent | React.KeyboardEvent
}

export function useNavigation({
	data,
	columnCount,
	rows,
	defaultCoords,
	suppressControls,
	getColumnAt,
	stopEditing,
	beginEditing,
	onCellChange,
	editorState,
	selectRow,
	                              onCreateRow
}: Props): [NavigationCoords, SelectCellFn] {
	const [coords, setCoords] = useState<NavigationCoords>(defaultCoords)
	const delayEditorDebounce = useRef<DebouncedFunc<any> | null>(null)

	const isMergedCell = (row: any, colIndex: number) => {
		const cell = row[colIndex]
		if (!cell) {
			console.warn('Cell not found in row ', row, colIndex)
			return false
		}
		if (cell.rowSpan > 1 || cell.first || cell.parentRow) {
			return true
		}

		return false
	}

	//Clear the selection if the grid has no rows (Still prototype)
	// useEffect(() => {
	// 	if (rows.length === 0 && coords.colIndex !== -1 && coords.rowIndex !== -1){
	// 		console.error("No rows")
	// 		selectCell({ rowIndex: -1, colIndex: - 1})
	// 	}
	// }, [rows, coords])

	//Cancels the debounce if the editor is prematurely open
	useEffect(() => {
		if (editorState && delayEditorDebounce.current) {
			delayEditorDebounce.current.cancel()
		}
	}, [editorState])

	//Cleanup the debounce on unmount
	useEffect(() => {
		return () => {
			delayEditorDebounce.current?.cancel()
		}
	}, [])

	/**
	 * @todo Not working, needs to be created in a different way
	 * @param id
	 */
	const findCellById = (id: string) => {
		let result: {
			cell: GridCell | null
			rowIndex: number
			cellIndex: number
		} = { cell: null, rowIndex: -1, cellIndex: -1 }
		data.map((row, rowIndex) => {
			row.forEach((cell, cellIndex) => {
				if (cell['id'] === id && !cell['dummy']) {
					result = { cell, rowIndex, cellIndex }
					return
				}
			})
		})

		return result
	}

	/** @todo Refactor all of this, dont use ids and use indexes instead for lookups **/
	const findMergedCellParent = (row: any, colIndex: number) => {
		// console.log("Checking for row");
		// console.log({ row, data, colIndex });

		const targetCell = row[colIndex]
		// console.log({ targetCell });
		if (!targetCell) {
			console.warn('Column does not exist in row -> ', row, colIndex)
			return
		}
		//If it is the first cell (main parent) we can directly bypass parent lookup
		if (targetCell.first && !targetCell.dummy) {
			const result = findCellById(targetCell.id)
			if (result) {
				return result
			}
		}

		//Check if we have parent and find its index
		if (targetCell.parentRow) {
			const result = findCellById(targetCell.parentRow.id)
			if (result) {
				return result
			}
		}

		//Fallback in case it has more than 1 span and also id defined
		if (targetCell.rowSpan > 1 && targetCell.id) {
			const result = findCellById(targetCell.id)
			if (result) {
				return { rowIndex: result.rowIndex, cell: result.cell }
			}
		}
		return null
	}

	function getDefaultValueFromValue(value: unknown) {
		if (Array.isArray(value)) {
			return []
		}
		if (typeof value === 'string') {
			return ''
		}
		if (typeof value === 'number') {
			return 0
		}
		return undefined
	}

	/**
	 * Recursively looks for the next navigable cell
	 * @param currentIndex
	 * @param direction
	 */
	const findNextNavigableColumnIndex = (currentIndex: number, direction: 'left' | 'right') => {
		const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1
		const nextCol = getColumnAt(nextIndex)
		//Fallback the current in case it was not found
		if (!nextCol) {
			return currentIndex
		}

		if (nextCol.disableNavigation) {
			return findNextNavigableColumnIndex(nextIndex, direction)
		}
		return nextIndex
	}

	const handleCellPaste = async (column: Header, currentValue: unknown) => {
		try {
			const text = await clipboardy.read()
			if (column.validatorHook) {
				if (column.validatorHook(text)) {
					return onCellChange?.({ coords, previousValue: currentValue, newValue: text })
				} else {
					return
				}
			}
			//Fallback is the column type
			if (column.type === ColumnCellType.Numeric) {
				if (!isNaN(Number(text))) {
					return onCellChange?.({ coords, previousValue: currentValue, newValue: text })
				} else {
					return
				}
			}
			if (column.type === ColumnCellType.Calendar) {
				if (dayjs(text, 'YYYY-MM-DD').format('YYYY-MM-DD') === text) {
					return onCellChange?.({ coords, previousValue: currentValue, newValue: text })
				} else {
					return
				}
			}

			return onCellChange?.({ coords, previousValue: currentValue, newValue: text })
		} catch (ex) {
			console.error(ex)
		}
	}

	const handleCellCut = async (currentValue: unknown) => {
		await clipboardy.write(String(currentValue))
		const newValue = getDefaultValueFromValue(currentValue)
		if (currentValue === newValue) {
			return
		}
		onCellChange?.({ coords, previousValue: currentValue, newValue })
	}

	function handleEditorOpenControls(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault()
			return stopEditing()
		}

		if (event.key === 'Enter') {
			event.preventDefault()
			return stopEditing()
		}
	}

	function handleControlOrMetaPressedControls(
		event: KeyboardEvent,
		header: Header,
		currentValue: unknown,
	) {
		if (event.key === 'x') {
			event.preventDefault()
			if (header.disableCellCut) {
				return
			}
			return handleCellCut(currentValue)
		}
		if (event.key === 'c') {
			event.preventDefault()
			return clipboardy.write(String(currentValue))
		}

		if (event.key === 'v') {
			event.preventDefault()
			if (header.disableCellPaste) {
				return
			}
			return handleCellPaste(header, currentValue)
		}
	}

	function handleArrowNavigationControls(event: KeyboardEvent) {
		/**
		 * @todo Consider non navigate cells and find the next navigable cell (considering merged cell) and also the direction
		 * we want to find (if its the next column or previous, next row or previous)
		 */
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			//Ensure we are not out of boundaries yet
			if (isIndexOutOfBoundaries(coords.rowIndex + 1, 0, rows.length - 1)) {
				return
			}

			const cell = data[coords.rowIndex]?.[coords.colIndex]
			//If cell is merged we sum the rowSpan on the current
			if (isMergedCell(data[coords.rowIndex], coords.colIndex)) {
				if (!cell.rowSpan) {
					console.error('Merged cell rowspan not found')
					return
				}
				const next = coords.rowIndex + cell.rowSpan
				return selectCell({ rowIndex: next, colIndex: coords.colIndex })
			}

			return selectCell({
				rowIndex: coords.rowIndex + 1,
				colIndex: coords.colIndex,
			})
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault()
			const nextIndex = coords.rowIndex - 1

			if (nextIndex < 0) {
				return
			}

			//Check the previous row and if one of them has row span. If so we jump into the first
			const cell = data[nextIndex]
			if (cell) {
				//If its merged we need to jump into its parent otherwise its just the previous index
				if (isMergedCell(data[nextIndex], coords.colIndex)) {
					const res = findMergedCellParent(data[nextIndex], coords.colIndex)
					if (res) {
						return selectCell({
							rowIndex: res.rowIndex,
							colIndex: coords.colIndex,
						})
					}
					return console.error('The result was not defined, please check if row/col exists')
				} else {
					return selectCell({ rowIndex: nextIndex, colIndex: coords.colIndex })
				}
			}
			return selectCell({
				rowIndex: coords.rowIndex - 1,
				colIndex: coords.colIndex,
			})
		}

		if (event.key === 'ArrowRight' || (event.key === 'Tab' && !event.shiftKey)) {
			event.preventDefault()
			let nextIndex = coords.colIndex + 1
			if (isIndexOutOfBoundaries(nextIndex, 0, columnCount - 1)) {
				return
			}
			//Is navigable?
			const col = getColumnAt(nextIndex)
			if (!col) {
				return console.error('Column not found at' + nextIndex)
			}

			if (col.disableNavigation) {
				nextIndex = findNextNavigableColumnIndex(coords.colIndex, 'right')
			}

			return selectCell({ rowIndex: coords.rowIndex, colIndex: nextIndex })
		}

		if (event.key === 'ArrowLeft' || (event.key === 'Tab' && event.shiftKey)) {
			event.preventDefault()
			let nextIndex = coords.colIndex - 1
			if (isIndexOutOfBoundaries(nextIndex, 0, columnCount - 1)) {
				return
			}
			const col = getColumnAt(nextIndex)
			if (!col) {
				return console.error('Column not found at ' + nextIndex)
			}

			if (col.disableNavigation) {
				nextIndex = findNextNavigableColumnIndex(coords.colIndex, 'left')
			}

			if (isMergedCell(data[coords.rowIndex], nextIndex)) {
				const res = findMergedCellParent(data[coords.rowIndex], nextIndex)
				if (res) {
					return selectCell({ rowIndex: res.rowIndex, colIndex: nextIndex })
				}
				return console.error('The result was not defined, please check if row/col exists')
			} else {
				return selectCell({ rowIndex: coords.rowIndex, colIndex: nextIndex })
			}
		}
	}

	function handleSelectionHeaderControls(event: KeyboardEvent, row: unknown) {
		//Enable only checkbox via enter
		if (event.key === 'Enter') {
			return selectRow(row)
		}
	}

	const onKeyDown = (event: KeyboardEvent) => {
		//Ensure we can proceed navigation under this two main conditions
		if (suppressControls || (editorState?.isPopup)) {
			return
		}

		const isCtrlPressed = (event.ctrlKey || event.metaKey) && !event.altKey
		//Common strategy - Must be on top level, its priority over normal navigation
		if (editorState && (event.key === 'Enter' || event.key === 'Escape')) {
			return handleEditorOpenControls(event)
		}

		/** @todo We need a better lookup and safe to prevent double grid collapse by probably fetching from parent ref **/
		const target = document.getElementById(`cell-${coords.rowIndex}-${coords.colIndex}`)
		if (!target) {
			return console.error('Cell not found')
		}

		//Travel like excel rules for non-editing
		if (!editorState) {
			if (event.key === 'F2'){
				event.preventDefault()
				return beginEditing({
					coords,
					targetElement: target,
				})
			}

			if (event.key === 'Enter' && onCreateRow){
				event.preventDefault()
				onCreateRow(coords)
			}
		}

		//Check if its a navigation key
		if (NavigationKey[event.key] !== undefined && !editorState) {
			return handleArrowNavigationControls(event)
		}

		const column = getColumnAt(coords.colIndex)
		if (!column) {
			return console.warn('Column not found')
		}

		const row = rows[coords.rowIndex]
		if (!row) {
			return console.warn('Row index')
		}
		const currentValue = (row as any)[column.accessor]

		//Handle specific keyboard handlers
		if (column.id === ROW_SELECTION_HEADER_ID) {
			return handleSelectionHeaderControls(event, row)
		}

		if (isCtrlPressed && !editorState) {
			return handleControlOrMetaPressedControls(event, column, currentValue)
		}

		//Handle cell deleting
		if ((event.key === 'Backspace' || event.key === 'Delete') && !editorState) {
			if (column.disableBackspace) {
				return
			}
			event.preventDefault()
			const newValue = getDefaultValueFromValue(currentValue)
			if (currentValue === newValue) {
				return
			}
			return onCellChange?.({
				newValue,
				previousValue: currentValue,
				coords,
			})
		}

		//If its numeric key and we are in numeric column, open with this key by default
		if (column.type === ColumnCellType.Numeric && !editorState) {
			const regex = /^[0-9]+$/
			if (regex.test(event.key)) {
				event.preventDefault()
				return beginEditing({
					coords,
					defaultKey: event.key,
					targetElement: target,
				})
			}
		}

		//If its any printable char, we allow to open editing
		if (!column.type && isPrintableChar(event.keyCode) && !isMetaKey(event.keyCode) && !editorState) {
			//Any key makes it to open and send the key pressed
			event.preventDefault()
			return beginEditing({
				coords,
				defaultKey: event.key,
				targetElement: target,
			})
		}
	}

	const selectCell = useCallback(
		({ colIndex, rowIndex }: NavigationCoords) => {
			//Coordinates when the grid is clicked away
			if (colIndex === -1 && rowIndex === -1) {
				setCoords({ colIndex, rowIndex })
			}

			//Equal selection comparison
			if (coords.colIndex === colIndex && coords.rowIndex === rowIndex) {
				return
			}

			//Validate boundaries
			if (
				isIndexOutOfBoundaries(colIndex, 0, columnCount - 1) ||
				isIndexOutOfBoundaries(rowIndex, 0, rows.length - 1)
			) {
				return
			}

			const column = getColumnAt(colIndex)
			if (!column) {
				return console.warn('Column not found ')
			}

			const isDisabled = isFunctionType(column.disableNavigation)
				? column.disableNavigation({ rowIndex, colIndex })
				: column.disableNavigation

			if (isDisabled) {
				return
			}

			const delayEditingOpen = column.delayEditorOpen
			//Cleanup
			if (delayEditorDebounce.current) {
				delayEditorDebounce.current.cancel()
				delayEditorDebounce.current = null
			}

			/**
			 * @todo Before we setCoords we need to sure scroll is visible and we can achive that
			 * by first checking if we have a scrollPresence (virtualize exposes that i think) and if the scrollTop Or left depending
			 * on the direction we are going, if they are centered horizontal/vertical with the middle of the target element
			 * We get the middle which is element height / 2 and add the middle into the start so we know exactly the middle point
			 * If the scroll is already in that range of height start to end of the element we do nothing, else we propagate it
			 * via a callback this hook will receive
			 * @todo Also we need to receive a function that allow us to get a cell element with the given coordinates
			 */
			if (delayEditingOpen) {
				delayEditorDebounce.current = debounce(() => {
					delayEditorDebounce.current = null
					const target = document.getElementById(`cell-${rowIndex}-${colIndex}`)
					if (!target) {
						return console.error('Cell not found on DEBOUNCE')
					}
					beginEditing({
						coords: { rowIndex, colIndex },
						targetElement: target,
					})
				}, delayEditingOpen)
				delayEditorDebounce.current()
			}
			setCoords({ colIndex, rowIndex })
		},
		[coords, rows, columnCount, getColumnAt, beginEditing],
	)

	useEffect(() => {
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [
		coords,
		data,
		getColumnAt,
		columnCount,
		suppressControls,
		beginEditing,
		stopEditing,
		onCellChange,
		editorState,
		selectRow,
	])

	return [coords, selectCell]
}
