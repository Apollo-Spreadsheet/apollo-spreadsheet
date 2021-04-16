import React, { forwardRef, useCallback, useRef } from 'react'
import {
  ClickAwayListener,
  Grid,
  makeStyles,
  Popper,
  PopperPlacementType,
  Theme,
  Typography,
} from '@material-ui/core'
import { EditorProps } from '../../../src'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: theme.spacing(0.5),
    boxShadow: '2px 4px 5px 5px rgba(0, 0, 0, 0.16)',
    outline: '#0000',
    backgroundColor: theme.palette.background.paper,
    width: 350,
    padding: theme.spacing(2.5),
  },
  mainTitle: {
    color: '#2D2D2D',
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    cursor: 'default',
  },
  subTitle: {
    color: '#4D4D4D',
    fontSize: 15,
    marginLeft: theme.spacing(1.5),
    marginTop: theme.spacing(0.5),
    cursor: 'default',
  },
  subText: {
    color: '#808080',
    fontSize: 15,
    marginLeft: theme.spacing(1.5),
    marginTop: theme.spacing(0.5),
    cursor: 'default',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  alignItems: {
    justifyContent: 'center',
    display: 'inline-flex',
    alignItems: 'center',
    alignContent: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

interface Props extends EditorProps {
  //lazyLoading?: boolean
  //getIdFromValue?: (value: unknown) => string
}

export const CustomPopper = forwardRef(({ stopEditing, anchorRef }: Props, ref) => {
  const classes = useStyles()
  const popperPlacement = useRef<PopperPlacementType>('right-start')

  const onCloseHandle = useCallback(() => {
    stopEditing({ save: false })
  }, [stopEditing])

  return (
    <Popper
      open
      id={'client-bill-editor'}
      anchorEl={anchorRef}
      aria-labelledby="billing dialog"
      aria-describedby="view client bill"
      className={classes.root}
    >
      {({ placement }) => {
        popperPlacement.current = placement
        return (
          <ClickAwayListener onClickAway={onCloseHandle}>
            <Grid container>
              <Grid item xs={12}>
                <Typography className={classes.mainTitle}>Client Details</Typography>
              </Grid>
              <Grid container className={classes.alignItems}>
                <Grid item xs={4}>
                  <Typography className={classes.subTitle}>E-mail</Typography>
                  <Typography className={classes.subTitle}>Phone</Typography>
                  <Typography className={classes.subTitle}>Address</Typography>
                  <Typography className={classes.subTitle}>Country</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography className={classes.subText}>{faker.internet.email()}</Typography>
                  <Typography className={classes.subText}>
                    {faker.phone.phoneNumberFormat()}
                  </Typography>
                  <Typography className={classes.subText}>
                    {faker.address.streetAddress()}
                  </Typography>
                  <Typography className={classes.subText}>{faker.address.country()}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </ClickAwayListener>
        )
      }}
    </Popper>
  )
})
