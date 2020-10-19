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
import { MergeCell } from '../mergeCells/interfaces/merge-cell'
import { MergePosition } from '../mergeCells/createMergedPositions'

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
	getSpanProperties: (coords: NavigationCoords) => MergeCell | undefined
	isMerged: (coords: NavigationCoords) => boolean
	mergedPositions: MergePosition[]
	getMergedPath: (rowIndex: number) => number[]
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
	isMerged,
	getSpanProperties,
	editorState,
	selectRow,
	onCreateRow,
	mergedPositions,
	getMergedPath,
}: Props): [NavigationCoords, SelectCellFn] {
	const [coords, setCoords] = useState<NavigationCoords>(defaultCoords)
	const delayEditorDebounce = useRef<DebouncedFunc<any> | null>(null)

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

	/** @todo Might need to consider colSpan **/
	function handleArrowNavigationControls(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			let nextRowIndex = coords.rowIndex + 1

			//If we have span we need to skip that to the next
			const currentCellSpan = getSpanProperties(coords)
			if (currentCellSpan) {
				nextRowIndex = coords.rowIndex + currentCellSpan.rowSpan
			}

			//Ensure we are not out of boundaries
			if (isIndexOutOfBoundaries(nextRowIndex, 0, rows.length - 1)) {
				return
			}

			return selectCell({
				rowIndex: nextRowIndex,
				colIndex: coords.colIndex,
			})
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault()
			let nextRowIndex = coords.rowIndex - 1

			//If we have span we need to skip that to the next
			const isNextMerged = isMerged({ rowIndex: nextRowIndex, colIndex: coords.colIndex })
			if (isNextMerged) {
				const path = getMergedPath(nextRowIndex)
				if (path.length !== 2) {
					return console.warn(
						`[Navigation] Merge group path not correct, returned ${path.length} positions instead of 2. Please review`,
					)
				}
				//Means we have the parent, parent comes in the first position always
				nextRowIndex = path[0]
			}

			//Ensure we are not out of boundaries
			if (nextRowIndex < 0) {
				return
			}

			return selectCell({
				rowIndex: nextRowIndex,
				colIndex: coords.colIndex,
			})
		}

		if (event.key === 'ArrowRight' || (event.key === 'Tab' && !event.shiftKey)) {
			event.preventDefault()
			let nextColIndex = coords.colIndex + 1

			if (isIndexOutOfBoundaries(nextColIndex, 0, columnCount - 1)) {
				return
			}

			//Is navigable?
			const col = getColumnAt(nextColIndex)
			if (!col) {
				return console.error('Column not found at' + nextColIndex)
			}

			if (col.disableNavigation) {
				nextColIndex = findNextNavigableColumnIndex(coords.colIndex, 'right')
			}

			if (isMerged({ rowIndex: coords.rowIndex, colIndex: nextColIndex })){
				const path = getMergedPath(coords.rowIndex)
				if (path.length === 2){
					return selectCell({
						rowIndex: path[0],
						colIndex: nextColIndex
					})
				} else {
					return console.warn(`[Navigation] Merge group path not correct, returned ${path.length} positions instead of 2. Please review`,)
				}
			}

			return selectCell({ rowIndex: coords.rowIndex, colIndex: nextColIndex })
		}

		if (event.key === 'ArrowLeft' || (event.key === 'Tab' && event.shiftKey)) {
			event.preventDefault()
			let nextColIndex = coords.colIndex - 1
			if (isIndexOutOfBoundaries(nextColIndex, 0, columnCount - 1)) {
				return
			}
			const col = getColumnAt(nextColIndex)
			if (!col) {
				return console.error('Column not found at ' + nextColIndex)
			}

			if (col.disableNavigation) {
				nextColIndex = findNextNavigableColumnIndex(coords.colIndex, 'left')
			}

			if (isMerged({ rowIndex: coords.rowIndex, colIndex: nextColIndex })){
				const path = getMergedPath(coords.rowIndex)
				if (path.length === 2){
					return selectCell({
						rowIndex: path[0],
						colIndex: nextColIndex
					})
				} else {
					return console.warn(`[Navigation] Merge group path not correct, returned ${path.length} positions instead of 2. Please review`,)
				}
			}

			return selectCell({ rowIndex: coords.rowIndex, colIndex: nextColIndex })
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
		if (suppressControls || editorState?.isPopup) {
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
			if (event.key === 'F2') {
				event.preventDefault()
				return beginEditing({
					coords,
					targetElement: target,
				})
			}

			if (event.key === 'Enter' && onCreateRow) {
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
		if (
			!column.type &&
			isPrintableChar(event.keyCode) &&
			!isMetaKey(event.keyCode) &&
			!editorState
		) {
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
