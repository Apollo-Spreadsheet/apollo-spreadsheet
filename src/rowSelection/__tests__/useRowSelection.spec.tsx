import React from 'react'
import { useRowSelection } from '../useRowSelection'
import { renderHook, act } from '@testing-library/react-hooks'
import { SelectionProps } from '../selectionProps'

describe('useRowSelection hook', () => {
	const rows = [{
		id: '1234',
	}, {
		id: '2222',
	}]

	const selection: SelectionProps<unknown> = {
		key: 'id',
	}

	it('should mount without any data', () => {
		const { result } = renderHook(() => useRowSelection({ rows: [] }))
		expect(result.current.getSelectedRows()).toEqual([])
		expect(result.current.isRowSelected('0')).toEqual(false)
	})

	it('should mount with data and selection', () => {
		const { result } = renderHook(() => useRowSelection({ rows, selection }))
		expect(result.current.getSelectedRows()).toEqual([])
		expect(result.current.isRowSelected('0')).toEqual(false)
	})

	it('should select a row', () => {
		const { result } = renderHook(() => useRowSelection({ rows, selection }))
		expect(result.current.getSelectedRows()).toEqual([])
		act(() => {
			result.current.selectRow(rows[0].id)
		})
		expect(result.current.getSelectedRows()).toEqual([rows[0].id])
		expect(result.current.isRowSelected(rows[0].id)).toEqual(true)
	})

	it('should select and unselect', () => {
		const { result } = renderHook(() => useRowSelection({ rows, selection }))
		expect(result.current.getSelectedRows()).toEqual([])
		act(() => {
			result.current.selectRow(rows[0].id)
		})
		expect(result.current.getSelectedRows()).toEqual([rows[0].id])
		expect(result.current.isRowSelected(rows[0].id)).toEqual(true)
		act(() => {
			result.current.selectRow(rows[0].id)
		})
		expect(result.current.getSelectedRows()).toEqual([])
		expect(result.current.isRowSelected('0')).toEqual(false)
	})

	it('should clean all selected if selection is disabled/set undefined', () => {
		const { result, rerender } = renderHook((props) => useRowSelection(props), {
			initialProps: {
				rows,
				selection,
			},
		})
		act(() => {
			result.current.selectRow(rows[1].id)
		})
		expect(result.current.getSelectedRows()).toEqual([rows[1].id])
		rerender({ rows, selection: undefined as any })
		expect(result.current.getSelectedRows()).toEqual([])
	})

	it('should not allow the second row to be selected', () => {
		const canSelect = (row: any) => {
			return row.id !== rows[1].id
		}
		const canSelectMock = jest.fn(canSelect)

		const { result } = renderHook(() => useRowSelection({
			rows,
			selection: { ...selection, canSelect: canSelectMock },
		}))
		expect(result.current.getSelectedRows()).toEqual([])
		expect(canSelectMock.mock.calls.length).toBe(0)
		act(() => {
			result.current.selectRow(rows[1].id)
		})
		expect(canSelectMock.mock.calls.length).toBe(1)
		expect(result.current.getSelectedRows()).toEqual([])
	})
})