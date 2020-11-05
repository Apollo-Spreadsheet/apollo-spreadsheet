import { renderHook } from '@testing-library/react-hooks'
import { useApiRef } from '../useApiRef'
import { useApiFactory } from '../useApiFactory'
import { useRef } from 'react'
import { GridTheme } from '../../types'

describe('useApiFactory', () => {
	it('should initialize', () => {
		const { result: mockedDivRef } = renderHook(() => useRef(document.createElement('div')))
		const { result: { current: apiRefMock } } = renderHook(() => useApiRef())
		const { result } = renderHook(() => {
			return useApiFactory(mockedDivRef.current, apiRefMock)
		})
		expect(result.current).toEqual(true)
		expect(apiRefMock.current.isInitialised).toEqual(true)
		expect(apiRefMock.current.theme).toBeUndefined()
		expect(apiRefMock.current.rootElementRef).toEqual(mockedDivRef.current)
	})

	it('should initialize with a custom theme', () => {
		const { result: mockedDivRef } = renderHook(() => useRef(document.createElement('div')))
		const customTheme: GridTheme = {
			currentRowClass: 'test'
		}
		const { result: { current: apiRefMock } } = renderHook(() => useApiRef())
		const { result } = renderHook(() => {
			return useApiFactory(mockedDivRef.current, apiRefMock, customTheme)
		})
		expect(result.current).toEqual(true)
		expect(apiRefMock.current.isInitialised).toEqual(true)
		expect(apiRefMock.current.theme).toEqual(customTheme)
		expect(apiRefMock.current.rootElementRef).toEqual(mockedDivRef.current)
	})
})