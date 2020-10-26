import React, { useCallback, useEffect, useState } from 'react'
import { useApiExtends } from './useApiExtends'
import { ApiRef } from './types/apiRef'
import { GridTheme } from '../types'
import { useLogger } from '../logger'

/**
 * Initializes a new api instance
 * @param gridRootRef
 * @param apiRef
 */
export function useApiFactory(
	gridRootRef: React.RefObject<HTMLDivElement>,
	apiRef: ApiRef,
	theme?: GridTheme,
): boolean {
	const logger = useLogger('useApiFactory')
	const [initialised, setInit] = useState(false)

	const publishEvent = useCallback(
		(name: string, ...args: any[]) => {
			apiRef.current.emit(name, ...args)
		},
		[apiRef],
	)

	const subscribeEvent = useCallback(
		(event: string, handler: (param: any) => void): (() => void) => {
			logger.debug(`Binding ${event} event`)
			apiRef.current.on(event, handler)
			const api = apiRef.current
			return () => {
				logger.debug(`Clearing ${event} event`)
				api.removeListener(event, handler)
			}
		},
		[apiRef],
	)

	useEffect(() => {
		logger.debug('Initializing grid api.')
		apiRef.current.isInitialised = true
		apiRef.current.rootElementRef = gridRootRef
		apiRef.current.theme = theme

		setInit(true)
		const api = apiRef.current

		return () => {
			logger.debug('Clearing all events listeners')
			api.removeAllListeners()
		}
	}, [gridRootRef, apiRef, theme])

	useApiExtends(apiRef, { subscribeEvent, dispatchEvent: publishEvent }, 'CoreApi')

	return initialised
}
