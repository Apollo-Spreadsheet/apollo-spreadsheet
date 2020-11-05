import { renderHook } from "@testing-library/react-hooks"
import { useApiRef } from '../useApiRef'

describe('useApiRef', () => {
	it('should be defined as EventEmitter', () => {
		const { result: { current: apiMock } } = renderHook(() => useApiRef())
		expect(apiMock.current).toBeDefined()
	})
})