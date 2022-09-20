import { GridTheme } from '../../src'
import * as styles from './styles-light.module.css'

export function useLightModeTheme() {
  console.log({ styles })
  return {
    theme: {
      currentRowClass: styles.currentRowClassLight,
      currentColumnClass: styles.currentColumnClass,
      headerClass: styles.headerClass,
      nestedHeaderClass: styles.nestedHeaderClass,
      cellClass: styles.cellClass,
      disabledCellClass: styles.disabledCellClass,
    } as GridTheme,
    containerClass: styles.container,
  }
}
