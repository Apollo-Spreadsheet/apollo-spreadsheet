import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
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
      background: '#1F1F1F !important' as any,
      color: '#E6E6E6',
      border: 'none',
      borderTop: `0.3px solid #A2ACB2`,
      fontWeight: 500,
      fontSize: '14px',
    },
  },
  cellClass: {
    border: '1.5px solid #1B1C1E',
    boxShadow: '0 0px 4px 0 rgba(0,0,0,0.08)',
    backgroundColor: '#2B2B2B',
    color: '#E6E6E6',
    fontSize: '14px',
  },
  disabledCellClass: {
    opacity: '0.6',
  },
}))

export function useDarkModeTheme() {
  const classes = useStyles()
  return { theme: classes as GridTheme, containerClass: classes.container }
}
