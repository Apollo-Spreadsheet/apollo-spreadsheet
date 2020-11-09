import React, { useRef } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { MergedCellsHookProps, useMergeCells } from '../useMergeCells'
import { MERGED_NEGATIVE_VALUES } from '../validationErrorMessages'
import { useApiFactory, useApiRef } from '../../api'

describe('useMergeCells hook', () => {
	const { result: { current: apiRefMock }} = renderHook(() => {
		const ref = useApiRef()
		const divRef = useRef(document.createElement('div'))
		useApiFactory(divRef, ref)
		return ref
	})

	const consoleSpy = jest
	.spyOn(console, 'error')
	.mockImplementation(() => {
	})

	afterEach(() => {
		consoleSpy.mockClear()
	})

	it('should mount without any data', () => {
		const props: MergedCellsHookProps = {
			apiRef: apiRefMock,
			initialised: apiRefMock.current.isInitialised,
			mergeCells: [],
			columnCount: 0,
			rowCount: 0
		}
		renderHook(() => useMergeCells(props))
		expect(apiRefMock.current.getMergedData()).toEqual([])
		expect(apiRefMock.current.getMergedGroups()).toEqual([])
	})

	it('should mount with data', () => {
		const props: MergedCellsHookProps = {
			apiRef: apiRefMock,
			initialised: apiRefMock.current.isInitialised,
			mergeCells: [{
				rowIndex: 0,
				colIndex: 0,
				rowSpan: 3,
				colSpan: 1,
			}],
			columnCount: 10,
			rowCount: 10,
		}
		renderHook(() => useMergeCells(props))
		expect(apiRefMock.current.getMergedData()).toEqual(props.mergeCells)
		expect(apiRefMock.current.isMerged({ rowIndex: 1, colIndex: 0})).toEqual(true)
		expect(apiRefMock.current.isMerged({ rowIndex: 2, colIndex: 0})).toEqual(true)
	})

	it('should dispatch console.error and ignore negative positions', () => {
		const props: MergedCellsHookProps = {
			apiRef: apiRefMock,
			initialised: apiRefMock.current.isInitialised,
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

		renderHook(() => useMergeCells(props))
		expect(apiRefMock.current.isMerged({ rowIndex: 1, colIndex: 0})).toEqual(true)
		expect(apiRefMock.current.isMerged({ rowIndex: 2, colIndex: 0})).toEqual(true)
		expect(apiRefMock.current.getMergedData()).toEqual([props.mergeCells![0]])
		expect(consoleSpy.mock.calls.length).toBe(1)
		expect(consoleSpy.mock.calls.map(e => e[0])).toEqual([MERGED_NEGATIVE_VALUES({ rowIndex: -1, colIndex: -1 })])
	})

	it('should fetch correctly the span properties', () => {
		const props: MergedCellsHookProps = {
			apiRef: apiRefMock,
			initialised: apiRefMock.current.isInitialised,
			mergeCells: [{
				rowIndex: 0,
				colIndex: 0,
				rowSpan: 3,
				colSpan: 1,
			}],
			columnCount: 10,
			rowCount: 10,
		}

		renderHook(() => useMergeCells(props))
		expect(apiRefMock.current.getMergedData()).toEqual(props.mergeCells)
		expect(apiRefMock.current.getSpanProperties({ rowIndex: 0, colIndex: 0 })).toEqual(props.mergeCells![0])
	})

	it('should not find any span properties for non existing coordinates', () => {
		const props: MergedCellsHookProps = {
			apiRef: apiRefMock,
			initialised: apiRefMock.current.isInitialised,
			mergeCells: [{
				rowIndex: 0,
				colIndex: 0,
				rowSpan: 3,
				colSpan: 1,
			}],
			columnCount: 10,
			rowCount: 10,
		}
		renderHook(() => useMergeCells(props))
		expect(apiRefMock.current.getMergedData()).toEqual(props.mergeCells)
		expect(apiRefMock.current.getSpanProperties({ rowIndex: 99, colIndex: 99 })).toBeUndefined()
	})
})