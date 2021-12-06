import { renderHook } from '@testing-library/react-hooks'
import { useApiEventHandler } from '../useApiEventHandler'
import { useApiRef } from '../useApiRef'
import { useApiFactory } from '../useApiFactory'
import { useRef } from 'react'

describe('useApiEventHandler', () => {
	const { result: { current: apiRefMock }} = renderHook(() => useApiRef())
	it('should be defined', () => {
		expect(apiRefMock.current).toBeDefined()
	})
	it('should be subscribe, handle a test event and clear the registered', () => {
		const mockedFn = jest.fn()
		renderHook(() => {
			const ref = useRef(document.createElement('div'))
			useApiFactory(ref, apiRefMock)
			useApiEventHandler(apiRefMock, 'test', mockedFn)
		})
		//First dispatch before removing
		apiRefMock.current.dispatchEvent('test')
		expect(mockedFn.mock.calls.length).toBe(1)
		apiRefMock.current.removeListener('test', mockedFn)
		//Re-dispatch but expect no handler
		apiRefMock.current.dispatchEvent('test')
		expect(mockedFn.mock.calls.length).toBe(1)
	})
})