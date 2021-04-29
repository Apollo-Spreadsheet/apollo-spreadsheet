import { EditorProps } from '../editorProps'
import { PaperProps } from '@material-ui/core'
import React from 'react'

export const createDefaultPaperProps = (
  anchorStyle: React.CSSProperties,
  isValidValue: boolean,
  additionalProps?: EditorProps['additionalProps'],
): Partial<PaperProps> => {
  let { border } = anchorStyle
  if (!isValidValue) {
    if (additionalProps?.invalidValueBorderColor) {
      border = `1px solid ${additionalProps?.invalidValueBorderColor}`
    } else {
      border = '1px solid red'
    }
  }

  return {
    style: {
      ...additionalProps?.containerProps,
      width: anchorStyle.width,
      minHeight: anchorStyle.height,
      overflow: 'hidden',
      zIndex: 10,
      border,
    },
  }
}
