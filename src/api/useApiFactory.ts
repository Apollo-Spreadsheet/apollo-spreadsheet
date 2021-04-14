/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useState } from 'react'
import { useApiExtends } from './useApiExtends'
import { ApiRef, GridApi } from './types'
import { GridTheme } from '../types'
import { useLogger } from '../logger'

/**
 * Initializes a new api instance
 * @param gridRootRef
 * @param apiRef
 * @param theme
 * @param selectionKey
 */
export function useApiFactory(
  gridRootRef: React.RefObject<HTMLDivElement>,
  apiRef: ApiRef,
  theme?: GridTheme,
  selectionKey?: string,
): boolean {
  const logger = useLogger('useApiFactory')
  const [initialised, setInit] = useState(false)

  const publishEvent = useCallback(
    (name: string, ...args: any[]) => {
      logger.debug(`Publishing event ${name}`)
      apiRef.current.emit(name, ...args)
    },
    [logger, apiRef],
  )

  const subscribeEvent = useCallback(
    (event: string, handler: (param: any) => void): (() => void) => {
      logger.debug(`Subscribing to event: ${event}`)
      apiRef.current.on(event, handler)
      const api = apiRef.current
      return () => {
        logger.debug(`Removing event listener: ${event}`)
        api.removeListener(event, handler)
      }
    },
    [apiRef, logger],
  )

  useEffect(() => {
    logger.debug('Initializing grid api.')
    apiRef.current.isInitialised = true
    apiRef.current.rootElementRef = gridRootRef
    /** @todo Consider whether we should have a custom hook useTheme in order to delegate the update and sync **/
    apiRef.current.theme = theme
    apiRef.current.selectionKey = selectionKey ?? 'id'
    setInit(true)
  }, [selectionKey, gridRootRef, apiRef, theme, logger])

  const apiMethods: Partial<GridApi> = { subscribeEvent, dispatchEvent: publishEvent }
  useApiExtends(apiRef, apiMethods, 'CoreApi')

  return initialised
}
