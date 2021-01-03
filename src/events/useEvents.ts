import React, { useCallback, useEffect } from 'react'
import { ApiRef } from '../api/types'
import { CELL_CLICK, CELL_DOUBLE_CLICK } from '../api'
import { useLogger } from '../logger'

export function useEvents(gridRootRef: React.RefObject<HTMLDivElement>, apiRef: ApiRef) {
  const logger = useLogger('useEvents')
  const createHandler = useCallback(
    (name: string) => (...args: any[]) => apiRef.current.dispatchEvent(name, ...args),
    [apiRef],
  )

  const onClickHandler = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isCell = target?.getAttribute('role') === 'cell' && !target?.getAttribute('data-dummy')
      if (isCell) {
        apiRef.current.dispatchEvent(CELL_CLICK, {
          event,
          colIndex: Number(target.getAttribute('aria-colindex') || '-1'),
          rowIndex: Number(target.getAttribute('data-rowindex') || '-1'),
        })
      } else {
        //Check if the parent is a cell
        const isParentCell =
          target.parentElement?.getAttribute('role') === 'cell' &&
          !target.parentElement?.getAttribute('data-dummy')
        if (isParentCell) {
          apiRef.current.dispatchEvent(CELL_CLICK, {
            event,
            colIndex: Number(target.parentElement?.getAttribute('aria-colindex') || '-1'),
            rowIndex: Number(target.parentElement?.getAttribute('data-rowindex') || '-1'),
          })
        }
      }
    },
    [apiRef],
  )

  const onDoubleClickHandler = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isCell = target?.getAttribute('role') === 'cell' && !target?.getAttribute('data-dummy')
      if (isCell) {
        apiRef.current.dispatchEvent(CELL_DOUBLE_CLICK, {
          event,
          colIndex: Number(target.getAttribute('aria-colindex') || '-1'),
          rowIndex: Number(target.getAttribute('data-rowindex') || '-1'),
          element: target,
        })
      } else {
        //Check if the parent is a cell
        const isParentCell =
          target.parentElement?.getAttribute('role') === 'cell' &&
          !target.parentElement?.getAttribute('data-dummy')
        if (isParentCell) {
          apiRef.current.dispatchEvent(CELL_DOUBLE_CLICK, {
            event,
            colIndex: Number(target.parentElement?.getAttribute('aria-colindex') || '-1'),
            rowIndex: Number(target.parentElement?.getAttribute('data-rowindex') || '-1'),
            element: target.parentElement,
          })
        }
      }
    },
    [apiRef],
  )

  useEffect(() => {
    if (gridRootRef && gridRootRef.current && apiRef.current?.isInitialised) {
      logger.debug('Binding events listeners')
      const keyDownHandler = createHandler('keydown')
      const gridRootElem = gridRootRef.current

      gridRootRef.current.addEventListener('click', onClickHandler, { capture: true })
      gridRootRef.current.addEventListener('dblclick', onDoubleClickHandler, { capture: true })

      document.addEventListener('keydown', keyDownHandler)

      // eslint-disable-next-line no-param-reassign
      apiRef.current.isInitialised = true
      const api = apiRef.current

      return () => {
        logger.debug('Clearing all events listeners')
        gridRootElem.removeEventListener('click', onClickHandler, { capture: true })
        gridRootElem.removeEventListener('dblclick', onDoubleClickHandler, { capture: true })
        document.removeEventListener('keydown', keyDownHandler)
        api.removeAllListeners()
      }
    }
  }, [gridRootRef, apiRef, logger, createHandler, onClickHandler, onDoubleClickHandler])
}
