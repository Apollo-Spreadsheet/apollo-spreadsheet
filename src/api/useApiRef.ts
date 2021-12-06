import { useRef } from 'react'
import { EventEmitter } from 'events'
import { ApiRef, GridApi } from './types'
import { useLogger } from '../logger'

/**
 * Hook that instantiate an ApiRef to pass in component prop.
 */
export function useApiRef(): ApiRef {
  const logger = useLogger('useApiRef')
  logger.debug('Creating a new ApiRef as EventEmitter.')
  return useRef<GridApi>(new EventEmitter() as GridApi)
}
