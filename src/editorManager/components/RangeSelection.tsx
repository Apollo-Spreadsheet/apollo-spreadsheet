import React, { memo } from 'react'
import { Popover, PopoverProps } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
    border: '1px solid #5984C2',
    backgroundColor: '#5984C2',
    opacity: '10%',
    color: '#DFEDEC',
  },
}))

interface RangeSelectionProps {
  anchorEl: PopoverProps['anchorEl']
  marginThreshold?: PopoverProps['marginThreshold']
  PaperProps?: PopoverProps['PaperProps']
  onClose: PopoverProps['onClose']
}

export const RangeSelection: React.FC<RangeSelectionProps> = memo(
  ({ children, anchorEl, PaperProps, marginThreshold, onClose }) => {
    const classes = useStyles()
    const transitionProps = { timeout: 0 }

    return (
      <Popover
        id={'range-selection'}
        anchorEl={anchorEl}
        open
        elevation={0}
        TransitionProps={transitionProps}
        onClose={onClose}
        marginThreshold={marginThreshold ?? 0}
        disableRestoreFocus
        PaperProps={{
          className: classes.root,
          ...PaperProps,
        }}
      >
        {children}
      </Popover>
    )
  },
)

export default RangeSelection
