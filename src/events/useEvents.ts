import React, { useCallback, useEffect } from 'react'
import { ApiRef, ApolloInternalEvents } from '../api'
import { useLogger } from '../logger'
import {
  createCoordsParseWarning,
  getCellCoordinatesFromDOMElement,
  isCellElement,
  NavigationCoords,
} from '../keyboard'
import { CellClickOrDoubleClickEventParams } from '../keyboard/types/cell-click-double-params'

export function useEvents(gridRootRef: React.RefObject<HTMLDivElement>, apiRef: ApiRef) {
  const logger = useLogger('useEvents')
  const createHandler = useCallback(
    (name: ApolloInternalEvents | string) => (...args: any[]) =>
      apiRef.current.dispatchEvent(name, ...args),
    [apiRef],
  )

  const handleClickOrDoubleClickEvent = useCallback(
    (event: MouseEvent) => {
      let target = event.target as HTMLElement
      if (!target) {
        return logger.warn(`[onClickHandler] Target element not defined, value: ${target}`)
      }
      let parsedCoords: NavigationCoords | undefined
      const isCell = isCellElement(target)
      if (isCell) {
        parsedCoords = getCellCoordinatesFromDOMElement(target)
      } else {
        //Check if the parent element is a cell
        if (!target.parentElement || !isCellElement(target.parentElement)) {
          return
        }
        parsedCoords = getCellCoordinatesFromDOMElement(target.parentElement)
        target = target.parentElement as HTMLElement
      }

      if (!parsedCoords) {
        return logger.warn(
          `[onClickHandler] ${createCoordsParseWarning(target.parentElement as HTMLElement)}`,
        )
      }

      const eventName: ApolloInternalEvents =
        event.type === 'click' ? 'CELL_CLICK' : 'CELL_DOUBLE_CLICK'

      const payload: CellClickOrDoubleClickEventParams = {
        event,
        element: target,
        ...parsedCoords,
      }
      apiRef.current.dispatchEvent(eventName, payload)
    },
    [apiRef, logger],
  )

  const handleRangeSelectionEvent = useCallback(
    (event: MouseEvent) => {
      console.log('range')
      let target = event.target as HTMLElement
      if (!target) {
        return logger.warn(`[onClickHandler] Target element not defined, value: ${target}`)
      }

      let parsedCoords: NavigationCoords | undefined
      const rows = apiRef.current.getRows()
      if (rows) {
        parsedCoords = getCellCoordinatesFromDOMElement(target)
      } else {
        //Check if the parent element is a cell
        if (!target.parentElement || !isCellElement(target.parentElement)) {
          return
        }
        parsedCoords = getCellCoordinatesFromDOMElement(target.parentElement)
        target = target.parentElement as HTMLElement
      }

      if (!parsedCoords) {
        return logger.warn(
          `[onClickHandler] ${createCoordsParseWarning(target.parentElement as HTMLElement)}`,
        )
      }

      const eventName: ApolloInternalEvents = 'RANGE_SELECTION'

      const payload: CellClickOrDoubleClickEventParams = {
        event,
        element: target,
        ...parsedCoords,
      }
      apiRef.current.dispatchEvent(eventName, payload)
    },
    [apiRef, logger],
  )

  useEffect(() => {
    if (gridRootRef && gridRootRef.current && apiRef.current?.isInitialised) {
      logger.debug('Binding events listeners')
      const keyDownHandler = createHandler('keydown')
      const gridRootElem = gridRootRef.current

      gridRootRef.current.addEventListener('click', handleClickOrDoubleClickEvent, {
        capture: true,
      })
      gridRootRef.current.addEventListener('dblclick', handleClickOrDoubleClickEvent, {
        capture: true,
      })
      // gridRootRef.current.addEventListener('mouseenter', handleRangeSelectionEvent, {
      //   capture: true,
      // })

      document.addEventListener('keydown', keyDownHandler)
      //gridRootRef.current.addEventListener('keydown', keyDownHandler)
      // eslint-disable-next-line no-param-reassign
      apiRef.current.isInitialised = true
      const api = apiRef.current

      return () => {
        logger.debug('Clearing all events listeners')
        gridRootElem.removeEventListener('click', handleClickOrDoubleClickEvent, { capture: true })
        gridRootElem.removeEventListener('dblclick', handleClickOrDoubleClickEvent, {
          capture: true,
        })
        // gridRootElem.removeEventListener('mouseenter', handleRangeSelectionEvent, {
        //   capture: true,
        // })
        //gridRootElem.removeEventListener('keydown', keyDownHandler)
        document.removeEventListener('keydown', keyDownHandler)
        /**
         * @todo Review the need of this
         * i think replacing gridRootElem.removeAllListeners would make more sense
         */
        api.removeAllListeners()
      }
    }
  }, [
    gridRootRef,
    apiRef,
    logger,
    createHandler,
    handleClickOrDoubleClickEvent,
    handleRangeSelectionEvent,
  ])
}
