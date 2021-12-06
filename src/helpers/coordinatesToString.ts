import { NavigationCoords } from '../keyboard'

export const coordinatesToString = (coords: NavigationCoords) => {
  return `[${coords.rowIndex}, ${coords.colIndex}]`
}
