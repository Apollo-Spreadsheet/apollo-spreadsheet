import { Logger } from './logger.interface'

export function localStorageAvailable() {
	try {
		// Incognito mode might reject access to the localStorage for security reasons.
		// window isn't defined on Node.js
		// https://stackoverflow.com/questions/16427636/check-if-localstorage-is-available
		const key = '__apollo_debugger_key__'
		window.localStorage.setItem(key, key)
		window.localStorage.removeItem(key)
		return true
	} catch (err) {
		return false
	}
}

const LOG_LEVELS = ['debug', 'info', 'warn', 'error']
// eslint-disable-next-line @typescript-eslint/no-empty-function
const empty = () => {}

/**
 * Returns a new logger instance
 * @param name
 * @param logLevel
 * @param appender
 */
export function createLoggerInstance(name: string, logLevel: string): Logger {
	const index = LOG_LEVELS.indexOf(logLevel)

	if (index === -1) {
		throw new Error(`Log level ${logLevel} not recognized.`)
	}

	const logger = LOG_LEVELS.reduce((e, method, i) => {
		const handler = { ...e }
		if (i >= index) {
			handler[method] = (...args: any[]) => {
				const [message, ...rest] = args
				if (typeof message === 'object' || Array.isArray(message)) {
					console[method](`${name}%c: `, 'color:white', message, ...rest)
				} else {
					console[method](`${name}%c: ${message}`, 'color:white', ...rest)
				}
			}
		} else {
			handler[method] = empty
		}
		return handler
	}, {} as any)

	return logger as Logger
}
