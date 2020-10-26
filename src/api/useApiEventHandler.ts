import { useEffect } from 'react'
import { ApiRef } from './types/apiRef'
import { useLogger } from '../logger'

export function useApiEventHandler(
	apiRef: ApiRef,
	eventName: string,
	handler?: (args: any) => void,
) {
	const logger = useLogger('useApiEventHandler')
	useEffect(() => {
		if (handler && eventName) {
			logger.debug(`Subscribing to ${eventName} with handler reference ${handler.name}`)
			return apiRef.current.subscribeEvent(eventName, handler)
		}

		return undefined
	}, [apiRef, eventName, handler, logger])
}
