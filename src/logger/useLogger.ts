import React from 'react'
import { Logger } from './logger.interface'
import { createLoggerInstance, localStorageAvailable } from './utils'

const forceDebug = localStorageAvailable() && window.localStorage.getItem('APOLLO_DEBUG') != null

export function loggerFactory(
	name: string,
	logLevel: string | boolean = process.env.NODE_ENV === 'production' ? 'error' : 'warn',
) {
	if (forceDebug) {
		return createLoggerInstance(name, 'debug')
	}

	return createLoggerInstance(name, logLevel.toString())
}

/**
 * Provides a logger utility that may be disabled in production or customized
 * @param name
 */
export function useLogger(name: string) {
	const { current } = React.useRef<Logger>(loggerFactory(name))
	return current
}
