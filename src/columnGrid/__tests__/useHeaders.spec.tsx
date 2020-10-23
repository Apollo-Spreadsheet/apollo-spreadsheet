import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useHeaders } from '../useHeaders'
import { StretchMode } from '../../types/stretch-mode.enum'
import { createColumnMock } from '../__mocks__/column-mock'
import { GridHeader } from '../types/header.type'

describe('useHeaders hook', () => {
	const consoleSpy = jest
	.spyOn(console, 'error')
	.mockImplementation(() => {
	})

	afterEach(() => {
		consoleSpy.mockClear()
	})


	it('should mount without any data', () => {
		const { result } = renderHook(() => useHeaders({
			columns: [],
			nestedHeaders: [],
			minColumnWidth: 50,
			stretchMode: StretchMode.All,
		}))
		expect(result.current.gridHeaders).toEqual([[]])
		expect(result.current.dynamicColumnCount).toBe(0)
	})

	it('should mount with a dynamic and fixed header', () => {
		const headers = [createColumnMock(), createColumnMock({ width: 200 })]
		const expectedHeadersData: GridHeader[] = headers.map(e => ({
			...e,
			isNested: false,
			colSpan: 0,
		}))
		const { result } = renderHook(() => useHeaders({
			columns: headers,
			nestedHeaders: [],
			minColumnWidth: 50,
			stretchMode: StretchMode.All,
		}))
		expect(result.current.gridHeaders).toEqual([expectedHeadersData])
		expect(result.current.dynamicColumnCount).toBe(1)
	})

	it('should throw error with duplicated header ids', () => {
		const headers = [
			createColumnMock({ id: 't1', width: 200 }),
			createColumnMock({ id: 't1', width: 200 }),
		]
		try {
			renderHook(() => useHeaders({
				columns: headers,
				nestedHeaders: [],
				minColumnWidth: 50,
				stretchMode: StretchMode.All,
			}))
		} catch (ex) {
			expect(ex).toBeTruthy()
		}
	})

	it('should throw error when span is bigger than total columns', () => {
		const headers = [createColumnMock({ width: 200 })]
		try {
			renderHook(() => useHeaders({
				columns: headers,
				nestedHeaders: [[{
					title: 'span 1',
					colSpan: 4,
				}]],
				minColumnWidth: 50,
				stretchMode: StretchMode.All,
			}))
		} catch (ex) {
			expect(ex).toBeTruthy()
		}
	})

	it('should merge with nested headers', () => {
		const headers = [createColumnMock({ id: 't1', accessor: 't1', width: 200 }), createColumnMock({
			id: 't2',
			accessor: 't2',
			width: 100,
		})]
		const { result } = renderHook(() => useHeaders({
			columns: headers,
			nestedHeaders: [[{
				title: 'Test',
				colSpan: 2,
			}]],
			minColumnWidth: 50,
			stretchMode: StretchMode.All,
		}))

		expect(result.current.gridHeaders).toMatchSnapshot()
		expect(result.current.dynamicColumnCount).toBe(0)
	})
})