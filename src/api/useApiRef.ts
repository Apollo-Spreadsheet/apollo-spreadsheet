import { useRef } from 'react'
import { EventEmitter } from 'events'
import { ApiRef } from "./types/apiRef"
import { GridApi } from "./types/gridApi"
import { useLogger } from "../logger"

/**
 * Hook that instantiate an ApiRef to pass in component prop.
 */
export function useApiRef(): ApiRef {
	const logger = useLogger('useApiRef')
	logger.debug('Initializing grid api with EventEmitter.')
	return useRef<GridApi>(new EventEmitter() as GridApi)
}
