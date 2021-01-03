import { EventEmitter } from 'events'
import React from 'react'
import { GridTheme } from '../../types'

/**
 * The core API interface that is available in the grid.
 */
export interface CoreApi extends EventEmitter {
  /**
   * The grid theme that is used to extend the default styling
   */
  theme?: GridTheme
  /**
   * The react ref of the grid root container div element.
   */
  rootElementRef?: React.RefObject<HTMLDivElement>
  /**
   * Property that comes true when the grid has its EventEmitter initialised.
   */
  isInitialised: boolean
  /**
   * Allows to register a handler for an event.
   * @param event
   * @param handler
   * @returns Unsubscribe Function
   */
  subscribeEvent: (event: string, handler: (param: any) => void) => () => void
  /**
   * Allows to emit an event.
   * @param name
   * @param args
   */
  dispatchEvent: (name: string, ...args: any[]) => void

  /**
   * Removes the focus from the grid and wipes the highlight
   */
  clearFocus(): void
}
