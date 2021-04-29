import { renderHook } from '@testing-library/react-hooks'
import { useApiRef } from '../useApiRef'
import { useApiFactory } from '../useApiFactory'
import { useRef } from 'react'

describe('useApiFactory', () => {
	it('should initialize', () => {
		const { result: mockedDivRef } = renderHook(() => useRef(document.createElement('div')))
		const { result: { current: apiRefMock } } = renderHook(() => useApiRef())
		const { result } = renderHook(() => {
			return useApiFactory(mockedDivRef.current, apiRefMock)
		})
		expect(result.current).toEqual(true)
		expect(apiRefMock.current.isInitialised).toEqual(true)
		expect(apiRefMock.current.rootElementRef).toEqual(mockedDivRef.current)
		expect(apiRefMock.current.getCellElementByCoordinates).toBeDefined()
		expect(apiRefMock.current.getColumnElementByCoordinates).toBeDefined()
	})
})