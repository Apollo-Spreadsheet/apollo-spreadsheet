import React, { useRef } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { StretchMode } from '../../types'
import { GridHeader } from '../types'
import { useApiFactory, useApiRef } from '../../api'
import { useHeaders } from "../hooks";
import { createColumnFixture } from "../fixtures/column.fixture";

describe('useHeaders hook', () => {
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
		const { result } = renderHook(() => useHeaders({
			columns: [],
			nestedHeaders: [],
			minColumnWidth: 50,
			stretchMode: StretchMode.All,
			apiRef: apiRefMock,
			initialised: apiRefMock.current.isInitialised
		}))
		expect(result.current.gridHeaders).toEqual([[]])
		expect(result.current.columns.length).toEqual(0)
	})

	it('should mount with a dynamic and fixed header', () => {
		const columnsMock = [createColumnFixture(), createColumnFixture({ width: 200 })]
		const expectedHeadersData: GridHeader[] = columnsMock.map(e => ({
			...e,
			isNested: false,
			colSpan: 0,
		}))
		const { result } = renderHook(() => useHeaders({
			columns: columnsMock,
			nestedHeaders: [],
			minColumnWidth: 50,
			stretchMode: StretchMode.All,
			apiRef: apiRefMock,
			initialised: apiRefMock.current.isInitialised
		}))
		expect(result.current.gridHeaders).toEqual([expectedHeadersData])
		expect(result.current.columns).toEqual(columnsMock)
	})

	it('should throw error with duplicated header ids', () => {
		const columnsMock = [
			createColumnFixture({ id: 't1', width: 200 }),
			createColumnFixture({ id: 't1', width: 200 }),
		]
		try {
			renderHook(() => useHeaders({
				columns: columnsMock,
				nestedHeaders: [],
				minColumnWidth: 50,
				stretchMode: StretchMode.All,
				apiRef: apiRefMock,
				initialised: apiRefMock.current.isInitialised
			}))
		} catch (ex) {
			expect(ex).toBeTruthy()
		}
	})

	it('should throw error when span is bigger than total columns', () => {
		const columnsMock = [createColumnFixture({ width: 200 })]
		try {
			renderHook(() => useHeaders({
				columns: columnsMock,
				nestedHeaders: [[{
					title: 'span 1',
					colSpan: 4,
				}]],
				minColumnWidth: 50,
				stretchMode: StretchMode.All,
				apiRef: apiRefMock,
				initialised: apiRefMock.current.isInitialised
			}))
		} catch (ex) {
			expect(ex).toBeTruthy()
		}
	})

	it('should merge with nested headers', () => {
		const columnsMock = [createColumnFixture({ id: 't1', accessor: 't1', width: 200 }), createColumnFixture({
			id: 't2',
			accessor: 't2',
			width: 100,
		})]
		const { result } = renderHook(() => useHeaders({
			columns: columnsMock,
			nestedHeaders: [[{
				title: 'Test',
				colSpan: 2,
			}]],
			minColumnWidth: 50,
			stretchMode: StretchMode.All,
			apiRef: apiRefMock,
			initialised: apiRefMock.current.isInitialised
		}))

		expect(result.current.gridHeaders).toMatchSnapshot()
		expect(result.current.columns).toBe(columnsMock)
	})
})