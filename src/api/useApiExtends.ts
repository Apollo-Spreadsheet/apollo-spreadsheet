import { useEffect } from 'react'
import { ApiRef } from './types/apiRef'
import { GridApi } from './types/gridApi'
import { useLogger } from '../logger'

export function useApiExtends(apiRef: ApiRef, apiMethods: Partial<GridApi>, apiName: string) {
	const logger = useLogger('useApiExtends')
	useEffect(() => {
		let hasMethodsInstalled = true
		if (!apiRef.current.isInitialised) {
			return
		}

		Object.keys(apiMethods).forEach(methodName => {
			if (!apiRef.current.hasOwnProperty(methodName)) {
				hasMethodsInstalled = false
			}
		})

		if (!hasMethodsInstalled) {
			logger.debug(`Adding ${apiName} to apiRef`)
			apiRef.current = Object.assign(apiRef.current, apiMethods) as GridApi
		}
	}, [apiRef.current.isInitialised, apiRef, apiMethods, apiName])
}
