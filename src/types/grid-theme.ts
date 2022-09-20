import { SxProps } from '@mui/material'

/**
 * @todo Theme must construct all the flows with styling
 * @todo Rename to ApolloTheme
 */
export interface GridTheme {
  /**
   * Styles the whole row where the cell is selected and
   * also applies styling to the highlighted cell
   */
  currentRowClass?: string | SxProps
  /**
   * Styles the active highlighted column
   */
  currentColumnClass?: string | SxProps
  headerClass?: string | SxProps
  nestedHeaderClass?: string | SxProps
  cellClass?: string | SxProps
  disabledCellClass?: string | SxProps
  /**
   * Styles to be applied in the root container of the active editor
   * Not every editor behaves the same and this will only work for default editor, if you wish
   * a more advanced configuration, use column/header `editorProps`
   */
  editorClass?: string | SxProps
  /**
   * Styles the editor parent container
   */
  editorContainerClass?: string | SxProps
}
