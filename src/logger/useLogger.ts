import React from 'react'
import { Logger } from './logger.interface'
import { loggerFactory } from './logger-factory'

/**
 * Provides a logger utility that may be disabled in production or customized
 * @param name
 */
export function useLogger(name: string) {
  const { current } = React.useRef<Logger>(loggerFactory(name))
  return current
}
