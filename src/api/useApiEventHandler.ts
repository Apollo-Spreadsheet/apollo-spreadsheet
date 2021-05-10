import { useEffect } from 'react'
import { ApiRef } from './types'
import { useLogger } from '../logger'
import { ApolloInternalEvents } from './eventConstants'

export function useApiEventHandler(
  apiRef: ApiRef,
  eventName: ApolloInternalEvents | string,
  handler?: (args: any) => void,
) {
  const logger = useLogger('useApiEventHandler')

  useEffect(() => {
    if (handler && eventName) {
      logger.debug(`Subscribing to ${eventName} with handler reference ${handler.name}`)
      return apiRef.current.subscribeEvent(eventName, handler)
    }

    logger.warn(
      `Event name or handler is missing therefore it isn't possible to subscribe. EventName: ${eventName}, Handler: ${handler}`,
    )
    return undefined
  }, [apiRef, eventName, handler, logger])
}
