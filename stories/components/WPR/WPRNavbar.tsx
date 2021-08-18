import {
  makeStyles,
  Box,
  Grid,
  Typography,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme,
  Tabs,
  tabsClasses,
  Tab,
} from '@material-ui/core'
import React, { memo, useMemo, useState, useCallback } from 'react'
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'

export const WPR_NAVBAR_HEIGHT = '40px'

const useStyles = makeStyles(theme => ({
  navbarContainer: {
    borderBottom: `2px solid #cccccc`,
  },
  pageTitle: {
    color: theme.palette.mode === 'dark' ? '#e6e6e6' : '#4d4d4d',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'default',
    height: 30,
    width: 250,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'inline-flex',
    backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#efefef',
    textAlign: 'center',
    borderRadius: '5px',
    [theme.breakpoints.down('md')]: {
      width: 130,
    },
  },
  dateTitle: {
    color: theme.palette.mode === 'dark' ? '#e6e6e6' : '#4d4d4d',
    cursor: 'default',
    justifyContent: 'center',
    display: 'flex',
  },
  changeLogBtn: {
    width: 90,
    height: 30,
    marginRight: '5px',
    cursor: 'pointer',
    '&:hover': {
      opacity: '80%',
    },
  },
  inlineButtons: {
    justifyContent: 'flex-end',
    display: 'flex',
    alignItems: 'center',
    alignContent: 'flex-end',
    textAlign: 'right',
    width: '100%',
  },
  historyLogContainer: {
    borderRadius: '0px 0px 10px 10px',
    border: '1px solid rgb(195,195,195)',
    boxShadow: '2px 4px 5px 5px rgba(0, 0, 0, 0.16)',
  },
  missingReport: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  missingReportIcon: {
    color: '#ff6464',
  },
  gridAlign: {
    justifyContent: 'flex-start',
    display: 'inline-flex',
    alignItems: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
  tabScrollButtons: {
    width: '10px',
    height: 20,
  },
  tabs: {
    marginTop: 10,
    width: '100%',
    fontWeight: 600,
    color: theme.palette.mode === 'dark' ? '#e6e6e6' : '#4d4d4d',
  },
  normalTab: {
    fontSize: '12px',
    marginRight: theme.spacing(1.5),
    flexDirection: 'row-reverse',
    marginTop: theme.spacing(1),
    color: 'white',
    borderRadius: '5px',
    fontWeight: 800,
    justifyContent: 'center',
    display: 'inline-flex',
    alignItems: 'center',
    alignContent: 'center',
    textAlign: 'center',
    padding: theme.spacing(0.2),
    margin: 0,
    minWidth: 100,
    minHeight: 30,
    zIndex: 100,
    [theme.breakpoints.down('sm')]: {
      minWidth: 80,
      fontSize: 10,
      minHeight: 27,
    },
  },
}))

interface Props {
  changes?: any[]
  handleNamespaceSelection: (id: string) => void
}

interface TabItem {
  name: string
}

const getTabColor = (isSelected: boolean) => {
  if (isSelected) {
    return '#77c698'
  }
  return '#cccccc'
}

function a11yProps(index: number, isSelected: boolean) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
    style: {
      backgroundColor: getTabColor(isSelected),
      color: 'white',
      opacity: isSelected ? 1 : 0.7,
    },
    disabled: false,
  }
}

export const WprNavbar: React.FC<Props> = memo(({ handleNamespaceSelection }) => {
  const classes = useStyles()
  const muiTheme = useTheme()
  const isSmallViewport = useMediaQuery(muiTheme.breakpoints.down('md'))
  const [activeTab, setActiveTab] = useState<number | boolean>(false)

  const tabs: TabItem[] = useMemo(
    () => [
      {
        name: 'Previous',
      },
      {
        name: 'Current',
      },
      {
        name: 'Next',
      },
    ],
    [],
  )

  const handleChangeTab = useCallback((event: React.ChangeEvent<any>, newValue: number) => {
    setActiveTab(newValue)
  }, [])

  return (
    <>
      <Box height={WPR_NAVBAR_HEIGHT}>
        <Grid container spacing={0} alignItems="center" className={classes.navbarContainer}>
          <Grid item xs={2} sm={2} md={3} lg={3}>
            {!isSmallViewport && <Typography className={classes.pageTitle}>Report Nº</Typography>}
            {isSmallViewport && <Typography className={classes.pageTitle}>{'WPR n '}</Typography>}
          </Grid>
          <Grid item xs={8} className={classes.gridAlign}>
            <Tabs
              className={classes.tabs}
              value={activeTab}
              onChange={handleChangeTab}
              scrollButtons="auto"
              allowScrollButtonsMobile
              variant="scrollable"
              aria-label="settings tabs"
              classes={{ scrollButtons: classes.tabScrollButtons }}
            >
              {tabs.map((e, i) => (
                <Tab
                  key={e.name}
                  label={e.name}
                  {...a11yProps(i, activeTab === i)}
                  className={classes.normalTab}
                  onClick={() => handleNamespaceSelection(e.name)}
                />
              ))}
            </Tabs>
            {/* <Tooltip title={'View Previous'} placement="top">
                <span>
                  <IconButton aria-label="previous" onClick={onNavigateBackClick}>
                    <NavigateBeforeIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Typography className={classes.dateTitle}>{'Week'}</Typography>
              <Tooltip title={'View Next'} placement="top">
                <span>
                  <IconButton aria-label="next" onClick={onNavigateForwardClick}>
                    <NavigateNextIcon />
                  </IconButton>
                </span>
              </Tooltip> */}
          </Grid>
        </Grid>
      </Box>
    </>
  )
})

export default WprNavbar
