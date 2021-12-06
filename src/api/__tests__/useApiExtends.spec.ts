import { renderHook } from '@testing-library/react-hooks'
import { useApiRef } from '../useApiRef'
import { useApiExtends } from '../useApiExtends'
import { GridApi } from '../types'
import { useApiFactory } from '../useApiFactory'
import { useRef } from 'react'

describe('useApiExtends', () => {
	const { result: { current: apiRefMock }} = renderHook(() => useApiRef())
	it('should be defined', () => {
		expect(apiRefMock.current).toBeDefined()
	})

	it('should not be able to extend if api is not initialized with factory', () => {
		const mockedMethods: Partial<GridApi> = {
			getColumns: jest.fn(),
		}
		renderHook(() => useApiExtends(apiRefMock, mockedMethods, 'test'))
		expect(apiRefMock.current.getColumns).toEqual(undefined)
	})


	it('should extend the apiRef and expose the methods correctly', () => {
		const mockedMethods: Partial<GridApi> = {
			getColumns: jest.fn(),
			getCells: jest.fn()
		}
		renderHook(() => {
			const mockedDivRef = useRef(document.createElement('div'))
			useApiFactory(mockedDivRef, apiRefMock)
		})
		renderHook(() => useApiExtends(apiRefMock, mockedMethods, 'test'))
		expect(apiRefMock.current.isInitialised).toEqual(true)
		expect(apiRefMock.current.getColumns).toEqual(mockedMethods.getColumns)
		expect(apiRefMock.current.getCells).toEqual(mockedMethods.getCells)
	})

	it('should not install the method if is already installed', () => {
		const mockedMethods: Partial<GridApi> = {
			getColumns: jest.fn(),
		}
		renderHook(() => {
			const mockedDivRef = useRef(document.createElement('div'))
			useApiFactory(mockedDivRef, apiRefMock)
		})
		renderHook(() => useApiExtends(apiRefMock, mockedMethods, 'test'))
		//In case some hook extends this functionality
		const getCellsMock = jest.fn().mockImplementation(() => 1)
		renderHook(() => useApiExtends(apiRefMock, { getCells: getCellsMock }, 'test'))
		expect(apiRefMock.current.isInitialised).toEqual(true)
		expect(apiRefMock.current.getColumns).toEqual(mockedMethods.getColumns)
		expect(apiRefMock.current.getCells).toBeDefined()
		expect(apiRefMock.current.getCells()).toBe(1)
		//In this case it should not set getCells
		const getCellsMock2 = jest.fn().mockImplementation(() => 2)
		renderHook(() => useApiExtends(apiRefMock, { getCells: getCellsMock2}, 'test'))
		expect(apiRefMock.current.getCells()).toBe(1)
	})

})