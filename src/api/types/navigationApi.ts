import { NavigationCoords } from '../../navigation'

export interface NavigationApi {
  /**
   * Returns the selected coordinates (If the row is merged, keep it mind that it will return
   * only the parent/first row or column index
   */
  getSelectedCoords: () => NavigationCoords
  /**
   * Selects a cell
   * @param coords
   * @param force   Bypass flag
   * @param targetElement Given in case the target cell has delayEditorOpen
   */
  selectCell: (coords: NavigationCoords, force?: boolean, targetElement?: HTMLElement) => void
}
