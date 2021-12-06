import React, { useRef } from 'react'
import { useRowSelection } from '../useRowSelection'
import { renderHook, act } from '@testing-library/react-hooks'
import { SelectionProps } from '../selectionProps'
import { useApiExtends, useApiFactory, useApiRef } from '../../api'

describe('useRowSelection hook', () => {
	const { result: { current: apiRefMock }} = renderHook(() => {
		const ref = useApiRef()
		const divRef = useRef(document.createElement('div'))
		useApiFactory(divRef, ref)
		const rows =  [{
			id: '1',
		}, {
			id: '2',
		}]

		//Set initial mockedRows
		useApiExtends(ref, {
			getRowAt: index => rows[index]
		}, 'test')
		return ref
	})

	const selection: SelectionProps = {
		key: 'id',
	}

	it('should extend the api and set RowSelectionApi', () => {
		renderHook(() => useRowSelection(apiRefMock, apiRefMock.current.isInitialised, undefined))
		expect(apiRefMock.current.getSelectedRowIds).toBeDefined()
		expect(apiRefMock.current.isRowSelected).toBeDefined()
		expect(apiRefMock.current.selectRow).toBeDefined()
	})

	it('should mount without any data or selection', () => {
		const { result } = renderHook(() => useRowSelection(apiRefMock, apiRefMock.current.isInitialised, undefined))
		expect(result.current.getSelectedRows()).toEqual([])
		expect(result.current.isRowSelected('0')).toEqual(false)
	})

	it('should mount with data and selection', () => {
		const { result } = renderHook(() => useRowSelection(apiRefMock, apiRefMock.current.isInitialised, undefined))
		expect(result.current.getSelectedRows()).toEqual([])
		expect(result.current.isRowSelected('0')).toEqual(false)
	})

	it('should select a row', () => {
		const { result } = renderHook(() => useRowSelection(apiRefMock, apiRefMock.current.isInitialised, undefined))
		expect(result.current.getSelectedRows()).toEqual([])
		const row = apiRefMock.current.getRowAt(0)!
		act(() => {
			result.current.selectRow(row.id)
		})
		expect(result.current.getSelectedRows()).toEqual([row.id])
		expect(result.current.isRowSelected(row.id)).toEqual(true)
	})

	it('should select and unselect', () => {
		const { result } = renderHook(() => useRowSelection(apiRefMock, apiRefMock.current.isInitialised, undefined))
		expect(result.current.getSelectedRows()).toEqual([])
		const row = apiRefMock.current.getRowAt(0)!
		act(() => {
			result.current.selectRow(row.id)
		})
		expect(result.current.getSelectedRows()).toEqual([row.id])
		expect(result.current.isRowSelected(row.id)).toEqual(true)
		act(() => {
			result.current.selectRow(row.id)
		})
		expect(result.current.getSelectedRows()).toEqual([])
		expect(result.current.isRowSelected('0')).toEqual(false)
	})

	it('should clean all selected if selection is disabled/set undefined', () => {
		const { result, rerender } = renderHook((props) => useRowSelection(apiRefMock, apiRefMock.current.isInitialised, props.selection), {
			initialProps: {
				selection,
			},
		})
		const row = apiRefMock.current.getRowAt(1)!
		act(() => {
			result.current.selectRow(row.id)
		})
		expect(result.current.getSelectedRows()).toEqual([row.id])
		rerender({ selection: undefined as any })
		expect(result.current.getSelectedRows()).toEqual([])
	})

	it('should not allow the second row to be selected', () => {
		const row = apiRefMock.current.getRowAt(1)!
		const canSelect = (e: any) => {
			return e.id !== row.id
		}
		const canSelectMock = jest.fn(canSelect)

		const { result, rerender } = renderHook((props) => useRowSelection(apiRefMock, apiRefMock.current.isInitialised, props.selection), {
			initialProps: {
				selection: { ...selection, canSelect: canSelectMock }
			},
		})

		expect(result.current.getSelectedRows()).toEqual([])
		expect(canSelectMock.mock.calls.length).toBe(0)
		act(() => {
			result.current.selectRow(row.id)
		})
		expect(canSelectMock.mock.calls.length).toBe(1)
		expect(result.current.getSelectedRows()).toEqual([])
	})
})