import { EventEmitter } from 'events'
import React from 'react'
import { GridTheme } from '../../types'
import { ApolloInternalEvents } from '../eventConstants'
import { NavigationCoords } from '../../keyboard'

/**
 * The core API interface that is available in the grid.
 */
export interface CoreApi extends EventEmitter {
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
  subscribeEvent: (
    event: ApolloInternalEvents | string,
    handler: (param: any) => void,
  ) => () => void
  /**
   * Allows to emit an event.
   * @param name
   * @param args
   */
  dispatchEvent: (event: ApolloInternalEvents | string, ...args: any[]) => void

  /**
   * Indicates whether the grid has focus active
   */
  isFocused: boolean

  /**
   * Focus the grid if its not focused yet
   */
  focus(): void

  /**
   * Removes the focus from the grid and wipes the highlight
   */
  clearFocus(): void

  /**
   * Returns the primary key attribute of a row (must be set on selection props at key field)
   * @todo Requires refactoring the selection.key usage to this method
   * @default id
   */
  selectionKey: string

  /**
   * Returns the cell dom node given the coordinates
   * @param coordinates
   */
  getCellElementByCoordinates: (coords: NavigationCoords) => Element | null | undefined

  /**
   * Returns the cell dom node given the coordinates
   * @param coordinates
   */
  getColumnElementByCoordinates: (coords: NavigationCoords) => Element | null | undefined
}
