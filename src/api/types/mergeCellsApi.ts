import { NavigationCoords } from "../../navigation/types/navigation-coords.type"
import { MergeCell } from "../../mergeCells/interfaces/merge-cell"
import { MergeGroup } from "../../mergeCells/createMergedGroups";

export interface MergeCellsApi {
  /**
   * Checks whether the given coordinates are within a merge or they are a merge
   * @param coords
   */
  isMerged: (coords: NavigationCoords) => boolean

  /**
   * Returns the whole path including all the children and the head as the parent
   * @param coords
   */
  getMergedPath: (rowIndex: number) => number[]

  /**
   * Returns the col/row span of the given colIndex/rowIndex
   * @param coords
   */
  getSpanProperties: (coords: NavigationCoords) => MergeCell | undefined

  /**
   * Returns the validated merged data which is being used in the grid
   */
  getMergedData: () => MergeCell[]

  /**
   * Returns an object that contains the parent rowIndex and all the path of children merged
   */
  getMergedGroups: () => MergeGroup
}