import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { useData } from '../useData'
import { createColumnMock } from '../../columnGrid/__mocks__/column-mock'
import { MergeCell } from '../../mergeCells/interfaces/merge-cell'
import { createMergedPositions } from '../../mergeCells/createMergedPositions'

describe('useData hook', () => {
	it('should mount without any data', () => {
		const { result } = renderHook(() => useData({
			rows: [],
			columns: [],
			selectRow: jest.fn(),
			isRowSelected: jest.fn(),
		}))
		expect(result.current.data.length).toBe(0)
	})

	it('should mount with rows (no merge cells)', () => {
		const mockHeaders = [createColumnMock()]
		const rows = [{ id: 1 }]
		const { result } = renderHook(() => useData({
			rows,
			columns: mockHeaders,
			selectRow: jest.fn(),
			isRowSelected: jest.fn(),
		}))
		expect(result.current.data).toEqual([[{
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
		const mergedPositions = createMergedPositions(mergeCells)
		const { result } = renderHook(() => useData({
			rows,
			mergeCells,
			mergedPositions,
			columns: mockHeaders,
			selectRow: jest.fn(),
			isRowSelected: jest.fn(),
		}))
		expect(result.current.data).toMatchSnapshot()
	})

	it('should bind selection cell', () => {
		const mockHeaders = [createColumnMock({ id: 'test', accessor: 'name' })]
		const rows = [{ id: 1, name: 'testName' }]
		const { result } = renderHook(() => useData({
			rows,
			columns: mockHeaders,
			selectRow: jest.fn(),
			isRowSelected: jest.fn(),
			selection: { key: 'id' },
		}))
		expect(result.current.data).toMatchSnapshot()
	})

})