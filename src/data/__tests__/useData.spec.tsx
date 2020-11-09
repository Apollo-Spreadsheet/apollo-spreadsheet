import React, { useRef } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { useData } from '../useData'
import { createColumnMock } from '../../columnGrid/__mocks__/column-mock'
import { MergeCell } from '../../mergeCells/interfaces'
import { useMergeCells } from '../../mergeCells'
import { useApiFactory, useApiRef } from '../../api'

describe('useData hook', () => {
	const { result: { current: apiRefMock }} = renderHook(() => {
		const ref = useApiRef()
		const divRef = useRef(document.createElement('div'))
		useApiFactory(divRef, ref)
		return ref
	})
	it('should mount without any data', () => {
		const { result } = renderHook(() => useData({
			apiRef: apiRefMock,
			rows: [],
			columns: [],
			initialised: apiRefMock.current.isInitialised
		}))
		expect(result.current.rows.length).toBe(0)
		expect(result.current.cells.length).toBe(0)
	})

	it('should mount with rows (no merge cells)', () => {
		const mockHeaders = [createColumnMock()]
		const rows = [{ id: 1 }]
		const { result } = renderHook(() => useData({
			rows,
			columns: mockHeaders,
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
		const mockHeaders = [createColumnMock()]
		const rows = [{ id: 1 }, { id: 2 }, { id: 3 }]
		const mergeCells: MergeCell[] = [{
			rowIndex: 0,
			rowSpan: 2,
			colSpan: 1,
			colIndex: 0,
		}]
		act(() => {
			renderHook(() => {
				useMergeCells({
					apiRef: apiRefMock,
					mergeCells,
					columnCount: mockHeaders.length,
					rowCount: rows.length,
					initialised: true
				})
			})
		})
		const { result } = renderHook(() => useData({
			rows,
			columns: mockHeaders,
			apiRef: apiRefMock,
			initialised: apiRefMock.current.isInitialised
		}))

		expect(result.current.cells).toMatchSnapshot()
	})
})