import { NavigationCoords } from "../../navigation/types/navigation-coords.type"

export interface NavigationApi {
  /**
   * Returns the selected coordinates (If the row is merged, keep it mind that it will return
   * only the parent/first row or column index
   */
  getSelectedCoords: () => NavigationCoords
  /**
   * Selects a cell
   * @param coords
   */
  selectCell: (coords: NavigationCoords) => void
}