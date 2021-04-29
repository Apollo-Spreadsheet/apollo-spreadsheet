/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useState } from 'react'
import { useApiExtends } from './useApiExtends'
import { ApiRef, GridApi } from './types'
import { useLogger } from '../logger'
import { ApolloInternalEvents } from './eventConstants'
import { createCellQuerySelector, createColumnQuerySelector, NavigationCoords } from '../keyboard'

/**
 * Initializes a new api instance
 * @param gridRootRef
 * @param apiRef
 * @param selectionKey
 */
export function useApiFactory(
  gridRootRef: React.RefObject<HTMLDivElement>,
  apiRef: ApiRef,
  selectionKey?: string,
): boolean {
  const logger = useLogger('useApiFactory')
  const [initialised, setInit] = useState(false)

  const publishEvent = useCallback(
    (name: ApolloInternalEvents | string, ...args: any[]) => {
      logger.debug(`Publishing event ${name}`)
      apiRef.current.emit(name, ...args)
    },
    [logger, apiRef],
  )

  const subscribeEvent = useCallback(
    (event: ApolloInternalEvents | string, handler: (param: any) => void): (() => void) => {
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
    apiRef.current.selectionKey = selectionKey ?? 'id'
    setInit(true)
  }, [selectionKey, gridRootRef, apiRef, logger])

  const getCellElementByCoordinates = useCallback(
    (coordinates: NavigationCoords) => {
      const selector = createCellQuerySelector(coordinates)
      return gridRootRef.current?.querySelector(selector)
    },
    [gridRootRef],
  )

  const getColumnElementByCoordinates = useCallback(
    (coordinates: NavigationCoords) => {
      const selector = createColumnQuerySelector(coordinates)
      return gridRootRef.current?.querySelector(selector)
    },
    [gridRootRef],
  )

  const apiMethods: Partial<GridApi> = {
    subscribeEvent,
    dispatchEvent: publishEvent,
    getCellElementByCoordinates,
    getColumnElementByCoordinates,
  }
  useApiExtends(apiRef, apiMethods, 'CoreApi')

  return initialised
}
