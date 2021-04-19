import { ApiRef, GridApi, ThemeApi, useApiExtends } from '../api'
import { GridTheme } from '../types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLogger } from '../logger'

interface Props {
  apiRef: ApiRef
  options?: GridTheme
}
export function useTheme({ apiRef, options }: Props): GridTheme | undefined {
  const logger = useLogger('useTheme')
  const loggerRef = useRef(logger)
  const api = useRef<GridApi>(apiRef.current)
  const [activeTheme, setActiveTheme] = useState<GridTheme | undefined>(options)
  const themeRef = useRef<GridTheme | undefined>(activeTheme)

  useEffect(() => {
    themeRef.current = activeTheme
  }, [activeTheme])

  useEffect(() => {
    api.current = apiRef.current
  }, [apiRef])

  useEffect(() => {
    loggerRef.current = logger
  }, [logger])

  useEffect(() => {
    loggerRef.current.debug('Theme options have changed')
    api.current.dispatchEvent('THEME_CHANGED', options)
    setActiveTheme(options)
  }, [options])

  const changeTheme = useCallback((options?: GridTheme) => {
    setActiveTheme(options)
  }, [])

  const getTheme = useCallback(() => {
    return themeRef.current
  }, [])

  const themeApi: ThemeApi = { changeTheme, getTheme }
  useApiExtends(apiRef, themeApi, 'ThemeApi')
  return activeTheme
}
