import React, { memo } from 'react'
import { Popover, PopoverProps } from '@material-ui/core'

interface EditorContainerProps {
  anchorEl: PopoverProps['anchorEl']
  marginThreshold?: PopoverProps['marginThreshold']
  PaperProps?: PopoverProps['PaperProps']
  onClose: PopoverProps['onClose']
  children: any
}

export const EditorContainer: React.FC<EditorContainerProps> = memo(
  ({ children, anchorEl, PaperProps, marginThreshold, onClose }) => {
    const transitionProps = { timeout: 0 }
    return (
      <Popover
        id={'editor-portal'}
        anchorEl={anchorEl}
        open
        elevation={0}
        TransitionProps={transitionProps}
        onClose={onClose}
        marginThreshold={marginThreshold ?? 0}
        disableRestoreFocus
        PaperProps={PaperProps}
      >
        {children}
      </Popover>
    )
  },
)

export default EditorContainer
