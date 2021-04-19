import { ApiRef, GridApi } from '../api'
import { GridTheme } from '../types'
import { useEffect, useRef, useState } from 'react'
import { useLogger } from '../logger'

interface Props {
  apiRef: ApiRef
  options?: GridTheme
}
export function useTheme({ apiRef, options }: Props): void {
  const logger = useLogger('useTheme')
  const loggerRef = useRef(logger)
  const api = useRef<GridApi>(apiRef.current)
  const [_, refresh] = useState<any>()

  useEffect(() => {
    api.current = apiRef.current
  }, [apiRef])

  useEffect(() => {
    loggerRef.current = logger
  }, [logger])

  useEffect(() => {
    loggerRef.current.debug('Theme options have changed')
    api.current.theme = options
    refresh(p => !p)
  }, [options])
}
