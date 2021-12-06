import { GridTheme } from '../../types'

export interface ThemeApi {
  getTheme(): GridTheme | undefined

  /**
   * Allows to change the theme or even clear by passing undefined value
   * @param theme
   */
  changeTheme(theme?: GridTheme): void
}
