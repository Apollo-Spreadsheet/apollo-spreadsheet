import React, { useRef } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { useData } from '../useData'
import { createColumnMock } from '../../columnGrid/__mocks__/column-mock'
import { MergeCell } from '../../mergeCells/interfaces'
import { useMergeCells } from '../../mergeCells'
import { useApiExtends, useApiFactory, useApiRef } from '../../api'
import { useHeaders } from '../../columnGrid'

describe('useData hook', () => {
	const mockedColumns = [createColumnMock()]
	const mockedMergedCells = []
	const { result: { current: apiRefMock }} = renderHook(() => {
		const ref = useApiRef()
		const divRef = useRef(document.createElement('div'))
		useApiFactory(divRef, ref)
		useHeaders({ columns: mockedColumns, apiRef: ref, initialised: true, minColumnWidth: 10 })
		useMergeCells({ mergeCells: mockedMergedCells, columnCount: 1, rowCount: 0, apiRef: ref, initialised: true })
		return ref
	})

	it('should mount without any data', () => {
		const emptyRows = []
		const { result } = renderHook(() => useData({
			apiRef: apiRefMock,
			rows: emptyRows,
			initialised: true
		}))
		expect(result.current.rows.length).toBe(0)
		expect(result.current.cells.length).toBe(0)
	})

	it('should mount with rows (no merge cells)', () => {
		act(() => {
			apiRefMock.current.updateColumns([createColumnMock()])
		})
		const rows = [{ id: 1 }]
		const { result } = renderHook(() => useData({
			rows,
			apiRef: apiRefMock,
			initialised: apiRefMock.current.isInitialised
		}))
		expect(result.current.rows).toEqual(rows)
		expect(result.current.cells).toEqual([[{
			colSpan: undefined,
			rowSpan: undefined,
			value: '',
		}]])
	})

	it('should mount with rows and merged cells', () => {
		const rows = [{ id: 1 }, { id: 2 }, { id: 3 }]
		const mergeCells: MergeCell[] = [{
			rowIndex: 0,
			rowSpan: 2,
			colSpan: 1,
			colIndex: 0,
		}]
		const { result: { current: apiRefLocal }} = renderHook(() => {
			const ref = useApiRef()
			const divRef = useRef(document.createElement('div'))
			useApiFactory(divRef, ref)
			useHeaders({ columns: mockedColumns, apiRef: ref, initialised: true, minColumnWidth: 10 })
			useMergeCells({ mergeCells, columnCount: 1, rowCount: rows.length, apiRef: ref, initialised: true })
			return ref
		})

		const { result } = renderHook(() => useData({
			rows,
			apiRef: apiRefLocal,
			initialised: apiRefLocal.current.isInitialised
		}))

		expect(apiRefLocal.current.getCells()).toEqual(result)
		expect(apiRefLocal.current.getCells()).toMatchSnapshot()
	})
})