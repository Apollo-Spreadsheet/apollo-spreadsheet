import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	isCtrlMetaKey,
	isIndexOutOfBoundaries,
	isMetaKey,
	isPrintableChar,
} from './navigation.utils'
import { NavigationCoords } from './types/navigation-coords.type'
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
import { ApiRef } from '../api/types/apiRef'
import { useApiEventHandler } from '../api/useApiEventHandler'
import { CELL_BEGIN_EDITING, CELL_CLICK, CELL_DOUBLE_CLICK } from '../api/eventConstants'
import { useApiExtends } from "../api/useApiExtends"

interface Props<TRow = unknown> {
	defaultCoords: NavigationCoords
	data: GridCell[][]
	columnCount: number
	suppressControls: boolean
	getColumnAt: GetColumnAt
	onCellChange?: (params: CellChangeParams) => void
	onCreateRow?: (coords: NavigationCoords) => void
	apiRef: ApiRef
	initialised: boolean
}

export type SelectCellFn = (params: NavigationCoords) => void

export interface KeyDownEventParams {
	event: KeyboardEvent | React.KeyboardEvent
}

export function useNavigation({
	data,
	columnCount,
	defaultCoords,
	suppressControls,
	getColumnAt,
	onCellChange,
	onCreateRow,
	apiRef,
	initialised,
}: Props): [NavigationCoords, SelectCellFn] {
	const coordsRef = useRef<NavigationCoords>(defaultCoords)
	const [coords, setCoords] = useState<NavigationCoords>(defaultCoords)
	const delayEditorDebounce = useRef<DebouncedFunc<any> | null>(null)

	const onCellBeginEditing = useCallback(
		() => {
			if (delayEditorDebounce.current) {
				delayEditorDebounce.current.cancel()
			}
		},
		[apiRef],
	)

	//Cancels the debounce if the editor is prematurely open
	useApiEventHandler(apiRef, CELL_BEGIN_EDITING, onCellBeginEditing)

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
			return apiRef.current.stopEditing()
		}

		if (event.key === 'Enter') {
			event.preventDefault()
			return apiRef.current.stopEditing()
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
			const currentCellSpan = apiRef.current.getSpanProperties(coords)
			if (currentCellSpan) {
				nextRowIndex = coords.rowIndex + currentCellSpan.rowSpan
			}

			//Ensure we are not out of boundaries
			if (isIndexOutOfBoundaries(nextRowIndex, 0, apiRef.current.getRowsCount() - 1)) {
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
			const isNextMerged = apiRef.current.isMerged({ rowIndex: nextRowIndex, colIndex: coords.colIndex })
			if (isNextMerged) {
				const path = apiRef.current.getMergedPath(nextRowIndex)
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

			if (apiRef.current.isMerged({ rowIndex: coords.rowIndex, colIndex: nextColIndex })) {
				const path = apiRef.current.getMergedPath(coords.rowIndex)
				if (path.length === 2) {
					return selectCell({
						rowIndex: path[0],
						colIndex: nextColIndex,
					})
				} else {
					return console.warn(
						`[Navigation] Merge group path not correct, returned ${path.length} positions instead of 2. Please review`,
					)
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

			if (apiRef.current.isMerged({ rowIndex: coords.rowIndex, colIndex: nextColIndex })) {
				const path = apiRef.current.getMergedPath(coords.rowIndex)
				if (path.length === 2) {
					return selectCell({
						rowIndex: path[0],
						colIndex: nextColIndex,
					})
				} else {
					return console.warn(
						`[Navigation] Merge group path not correct, returned ${path.length} positions instead of 2. Please review`,
					)
				}
			}

			return selectCell({ rowIndex: coords.rowIndex, colIndex: nextColIndex })
		}
	}

	function handleSelectionHeaderControls(event: KeyboardEvent, row: unknown) {
		//Enable only checkbox via enter
		if (event.key === 'Enter') {
			return apiRef.current.selectRow(row)
		}
	}

	const selectCell = useCallback(
		({ colIndex, rowIndex }: NavigationCoords) => {
			//Coordinates when the grid is clicked away
			if (colIndex === -1 && rowIndex === -1) {
				coordsRef.current = { colIndex, rowIndex }
				return setCoords({ colIndex, rowIndex })
			}

			//Equal selection comparison
			if (coords.colIndex === colIndex && coords.rowIndex === rowIndex) {
				return
			}

			//Validate boundaries
			if (
				isIndexOutOfBoundaries(colIndex, 0, columnCount - 1) ||
				isIndexOutOfBoundaries(rowIndex, 0, apiRef.current.getRowsCount() - 1)
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
					const target = apiRef.current.rootElementRef?.current?.querySelector(
						`[aria-colIndex='${colIndex}'][data-rowIndex='${rowIndex}'][role='cell']`,
					)
					if (!target) {
						return console.error('Cell dom element not found on delayEditingOpen debounce')
					}

					apiRef.current.beginEditing({
						coords: { rowIndex, colIndex },
						targetElement: target,
					})
				}, delayEditingOpen)
				delayEditorDebounce.current()
			}
			coordsRef.current = { colIndex, rowIndex }
			setCoords({ colIndex, rowIndex })
		},
		[coords, columnCount, getColumnAt, apiRef],
	)

	const onKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const editorState = apiRef.current.getEditorState()
			//Ensure we can proceed navigation under this core conditions
			if (!initialised || suppressControls || editorState?.isPopup) {
				return
			}

			const isCtrlPressed = (event.ctrlKey || event.metaKey) && !event.altKey
			//Common strategy - Must be on top level, its priority over normal navigation
			if (editorState && (event.key === 'Enter' || event.key === 'Escape')) {
				return handleEditorOpenControls(event)
			}

			const cellElement = apiRef.current.rootElementRef?.current?.querySelector(
				`[aria-colIndex='${coords.colIndex}'][data-rowIndex='${coords.rowIndex}'][role='cell']`,
			)
			if (!cellElement) {
				return console.error('Cell DOM element not found')
			}

			const column = getColumnAt(coords.colIndex)
			if (!column) {
				return console.warn('Column not found')
			}

			//Travel like excel rules for non-editing
			if (!editorState) {
				if (event.key === 'F2') {
					event.preventDefault()
					return apiRef.current.beginEditing({
						coords,
						targetElement: cellElement,
					})
				}

				if (event.key === 'Enter' && onCreateRow && column.id !== ROW_SELECTION_HEADER_ID) {
					event.preventDefault()
					onCreateRow(coords)
				}
			}

			//Check if its a navigation key
			if (NavigationKey[event.key] !== undefined && !editorState) {
				return handleArrowNavigationControls(event)
			}

			const row = apiRef.current.getRows()[coords.rowIndex]
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
					return apiRef.current.beginEditing({
						coords,
						defaultKey: event.key,
						targetElement: cellElement,
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
				return apiRef.current.beginEditing({
					coords,
					defaultKey: event.key,
					targetElement: cellElement,
				})
			}
		},
		[coords, data, getColumnAt, columnCount, suppressControls, onCellChange, initialised, apiRef],
	)

	const onCellClick = useCallback(
		({ event, colIndex, rowIndex }: { event: MouseEvent; colIndex: number; rowIndex: number }) => {
			event.preventDefault()
			selectCell({ rowIndex, colIndex })
		},
		[apiRef, selectCell],
	)

	const onCellDoubleClick = useCallback(
		({ event, colIndex, rowIndex }: { event: MouseEvent; colIndex: number; rowIndex: number }) => {
			event.preventDefault()
			//Compare if the cell is equal to whats selected otherwise select it first
			if (colIndex !== coords.colIndex && rowIndex !== coords.rowIndex) {
				selectCell({ rowIndex, colIndex })
			}
			apiRef.current.beginEditing({
				coords: { colIndex, rowIndex },
				targetElement: event.target as Element,
			})
		},
		[apiRef, selectCell, coords],
	)

	const getSelectedCoords = useCallback(() => coordsRef.current, [])
	useApiEventHandler(apiRef, 'keydown', onKeyDown)
	useApiEventHandler(apiRef, CELL_CLICK, onCellClick)
	useApiEventHandler(apiRef, CELL_DOUBLE_CLICK, onCellDoubleClick)
	useApiExtends(apiRef, {
		getSelectedCoords,
		selectCell
	}, 'NavigationApi')
	return [coords, selectCell]
}
