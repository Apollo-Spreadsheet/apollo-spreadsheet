import React, { useCallback, useState } from "react"
import { useApiExtends } from './useApiExtends'
import { ApiRef } from './types/apiRef'

/**
 * Initializes a new api instance
 * @param gridRootRef
 * @param apiRef
 */
export function useApiFactory(
	gridRootRef: React.RefObject<HTMLDivElement>,
	apiRef: ApiRef,
): boolean {
	const [initialised, setInit] = useState(false)

	const publishEvent = useCallback(
		(name: string, ...args: any[]) => {
			apiRef.current.emit(name, ...args)
		},
		[apiRef],
	)

	const subscribeEvent = useCallback(
		(event: string, handler: (param: any) => void): (() => void) => {
			console.debug(`Binding ${event} event`)
			apiRef.current.on(event, handler)
			const api = apiRef.current
			return () => {
				console.debug(`Clearing ${event} event`)
				api.removeListener(event, handler)
			}
		},
		[apiRef],
	)

	React.useEffect(() => {
		console.debug('Initializing grid api.')
		apiRef.current.isInitialised = true
		apiRef.current.rootElementRef = gridRootRef

		setInit(true)
		const api = apiRef.current

		return () => {
			console.debug('Clearing all events listeners')
			api.removeAllListeners()
		}
	}, [gridRootRef, apiRef])

	useApiExtends(apiRef, { subscribeEvent, dispatchEvent: publishEvent }, 'CoreApi')

	return initialised
}
