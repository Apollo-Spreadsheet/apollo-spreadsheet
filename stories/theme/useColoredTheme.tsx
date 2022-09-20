import { GridTheme } from '../../src'
import styles from './styles-colored.module.css'

export function useColoredTheme() {
  return {
    theme: {
      currentRowClass: styles.currentRowClass,
      currentColumnClass: styles.currentColumnClass,
      headerClass: styles.headerClass,
      nestedHeaderClass: styles.nestedHeaderClass,
      cellClass: styles.cellClass,
      disabledCellClass: styles.disabledCellClass,
    } as GridTheme,
    containerClass: styles.container,
  }
}
