import { createLoggerInstance, localStorageAvailable } from './utils'

const forceDebug = localStorageAvailable() && window.localStorage.getItem('APOLLO_DEBUG') != null

/**
 * Creates a new logger instance
 * If you wish to force the debug, ensure `APOLLO_DEBUG` is defined in localStorage
 * @param name
 * @param logLevel
 */
export function loggerFactory(
  name: string,
  logLevel: string | boolean = process.env.NODE_ENV === 'production' ? 'error' : 'warn',
) {
  if (forceDebug) {
    return createLoggerInstance(name, 'debug')
  }

  return createLoggerInstance(name, logLevel.toString())
}
