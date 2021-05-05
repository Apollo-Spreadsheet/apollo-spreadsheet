import { makeStyles } from '@material-ui/core/styles'
import { Theme } from '@material-ui/core'
import { GridTheme } from '../../src'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    height: '100%',
    width: '100%',
  },
  currentRowClass: {
    '&&': {
      fontWeight: 500,
      //   color: '#6E75F8',
      //   backgroundColor: '#EAEAFE',
    },
  },
  currentColumnClass: {
    '&&&': {
      fontWeight: 700,
    },
  },
  headerClass: {
    '&&': {
      background: '#FFFFFF !important' as any,
      color: '#4D4D4D',
      border: 'none',
      borderTop: `1px solid #CCCCCC`,
      fontWeight: 500,
      fontSize: '14px',
    },
  },
  cellClass: {
    border: '1.5px solid white',
    boxShadow: '0 0px 4px 0 rgba(0,0,0,0.08)',
    backgroundColor: '#F5F5F5',
    color: '#4D4D4D',
    fontSize: '14px',
  },
  disabledCellClass: {
    opacity: '0.6',
  },
}))

export function useLightModeTheme() {
  const classes = useStyles()
  return { theme: classes as GridTheme, containerClass: classes.container }
}
