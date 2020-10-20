import { useEffect  } from 'react'
import { ApiRef } from './types/apiRef'

export function useApiEventHandler(
	apiRef: ApiRef,
	eventName: string,
	handler?: (args: any) => void,
) {
	useEffect(() => {
		if (handler && eventName) {
			return apiRef.current.subscribeEvent(eventName, handler)
		}

		return undefined
	}, [apiRef, eventName, handler])
}
