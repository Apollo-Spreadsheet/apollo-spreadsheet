import { NavigationCoords } from '../navigation/types/navigation-coords.type'

export const MERGED_NEGATIVE_VALUES = ({ rowIndex, colIndex }: NavigationCoords) =>
  `Merged cell contains negative values, therefore it cannot be added to the collection [${rowIndex},${colIndex}]`

export const MERGED_OUT_OF_BONDS = ({ rowIndex, colIndex }: NavigationCoords) =>
  `Merged cell is out of boundaries, you must review the given configuration, therefore it cannot be added to the collection [${rowIndex},${colIndex}]`

export const MERGED_SINGLE_CELL = ({
  rowIndex,
  colIndex,
}: NavigationCoords) => `The merged cell declared at [${rowIndex}, ${colIndex}] has both "rowspan"\x20
      and "colspan" declared as "1", which makes it a single cell. It cannot be added to the collection`

export const MERGED_ZERO_SPAN = ({
  rowIndex,
  colIndex,
}: NavigationCoords) => `The merged cell declared at [${rowIndex}, ${colIndex}] has "rowspan"\x20
      or "colspan" declared as "0", which is not supported. It cannot be added to the collection.`

export const MERGED_DUPLICATED = ({ rowIndex, colIndex }: NavigationCoords) =>
  `The merged cell declared at [${rowIndex}, ${colIndex}] already exists and seems to be duplicated. It cannot be added to the collection twice.`

export const MERGED_OVERLAP = ({
  rowIndex,
  colIndex,
}: NavigationCoords) => `The merged cell declared at [${rowIndex}, ${colIndex}], overlaps\x20
			with the other declared merged cell. The overlapping merged cell was not added to the table, please\x20
			fix your setup.`
