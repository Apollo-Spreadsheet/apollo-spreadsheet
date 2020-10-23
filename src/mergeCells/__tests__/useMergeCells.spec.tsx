import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { MergedCellsHookProps, useMergeCells } from '../useMergeCells'
import { MergePosition } from '../createMergedPositions'
import { MERGED_NEGATIVE_VALUES } from '../validationErrorMessages'

describe('useMergeCells hook', () => {
	const consoleSpy = jest
	.spyOn(console, 'error')
	.mockImplementation(() => {
	})

	afterEach(() => {
		consoleSpy.mockClear()
	})

	it('should mount without any data', () => {
		const props: MergedCellsHookProps = {
			mergeCells: [],
			columnCount: 0,
			rowCount: 0,
		}
		const { result } = renderHook(() => useMergeCells(props))
		expect(result.current.mergedPositions).toEqual([])
		expect(result.current.mergeData).toEqual([])
	})

	it('should mount with data', () => {
		const props: MergedCellsHookProps = {
			mergeCells: [{
				rowIndex: 0,
				colIndex: 0,
				rowSpan: 3,
				colSpan: 1,
			}],
			columnCount: 10,
			rowCount: 10,
		}
		const expectedMergedPositions: MergePosition[] = [
			{ row: 1, col: 0 },
			{ row: 2, col: 0 },
		]
		const { result } = renderHook(() => useMergeCells(props))
		expect(result.current.mergedPositions).toEqual(expectedMergedPositions)
		expect(result.current.mergeData).toEqual(props.mergeCells)
	})

	it('should dispatch console.error and ignore negative positions', () => {
		const props: MergedCellsHookProps = {
			mergeCells: [{
				rowIndex: 0,
				colIndex: 0,
				rowSpan: 3,
				colSpan: 1,
			}, {
				rowIndex: -1,
				colIndex: -1,
				rowSpan: 0,
				colSpan: 0,
			}],
			columnCount: 10,
			rowCount: 10,
		}
		const expectedMergedPositions: MergePosition[] = [
			{ row: 1, col: 0 },
			{ row: 2, col: 0 },
		]
		const { result } = renderHook(() => useMergeCells(props))
		expect(result.current.mergedPositions).toEqual(expectedMergedPositions)
		expect(result.current.mergeData).toEqual([props.mergeCells![0]])
		expect(consoleSpy.mock.calls.length).toBe(1)
		expect(consoleSpy.mock.calls.map(e => e[0])).toEqual([MERGED_NEGATIVE_VALUES({ rowIndex: -1, colIndex: -1 })])
	})

	it('should fetch correctly the span properties', () => {
		const props: MergedCellsHookProps = {
			mergeCells: [{
				rowIndex: 0,
				colIndex: 0,
				rowSpan: 3,
				colSpan: 1,
			}],
			columnCount: 10,
			rowCount: 10,
		}
		const { result } = renderHook(() => useMergeCells(props))
		expect(result.current.mergeData).toEqual(props.mergeCells)
		expect(result.current.getSpanProperties({ rowIndex: 0, colIndex: 0 })).toEqual(props.mergeCells![0])
	})

	it('should not find any span properties for non existing coordinates', () => {
		const props: MergedCellsHookProps = {
			mergeCells: [{
				rowIndex: 0,
				colIndex: 0,
				rowSpan: 3,
				colSpan: 1,
			}],
			columnCount: 10,
			rowCount: 10,
		}
		const { result } = renderHook(() => useMergeCells(props))
		expect(result.current.mergeData).toEqual(props.mergeCells)
		expect(result.current.getSpanProperties({ rowIndex: 99, colIndex: 99 })).toBeUndefined()
	})
})