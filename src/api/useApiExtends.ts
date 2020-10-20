import { useEffect } from "react"
import { ApiRef } from "./types/apiRef"
import { GridApi } from "./types/gridApi"

export function useApiExtends(apiRef: ApiRef, apiMethods: Partial<GridApi>, apiName: string) {
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
			console.log(`Adding ${apiName} to apiRef`)
			apiRef.current = Object.assign(apiRef.current, apiMethods) as GridApi
		}
	}, [apiRef.current.isInitialised, apiRef, apiMethods, apiName])
}
