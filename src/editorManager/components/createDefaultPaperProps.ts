import { EditorProps } from '../editorProps'
import { PaperProps } from '@mui/material'
import React, { CSSProperties } from 'react'
import { GridTheme } from '../../types'

export const createDefaultPaperProps = (
  anchorStyle: React.CSSProperties,
  isValidValue: boolean,
  additionalProps?: EditorProps['additionalProps'],
  theme?: GridTheme,
): Partial<PaperProps> => {
  let { border } = anchorStyle
  if (!isValidValue) {
    if (additionalProps?.invalidValueBorderColor) {
      border = `1px solid ${additionalProps?.invalidValueBorderColor}`
    } else {
      border = '1px solid red'
    }
  }

  const style: CSSProperties = {
    ...additionalProps?.containerProps,
    width: anchorStyle.width,
    minHeight: anchorStyle.height,
    overflow: 'hidden',
    zIndex: 10,
    border,
  }

  return {
    style,
    className: theme?.editorContainerClass,
  }
}
