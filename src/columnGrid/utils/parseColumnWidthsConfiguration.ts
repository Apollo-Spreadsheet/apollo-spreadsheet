import { percentageToPixels } from './percentageToPixels'
import React from 'react'

/**
 * Converts the column widths from percentage or px down to pure number value (which is pixels in the end) for fixed column width configuration
 * @param value
 * @param containerWidth
 * @param minColumnWidth
 */
export const parseColumnWidthsConfiguration = (value: React.ReactText, containerWidth: number) => {
  const isPercentage = typeof value === 'string' && value.includes('%')
  const isPixels = typeof value === 'string' && value.includes('px')

  if (isPercentage) {
    const parsedValue = Number(value.toString().replace('%', '').trim())
    if (isNaN(parsedValue)) {
      throw new Error(`${parsedValue} value is an invalid percentage value`)
    }

    //Ensure its within a valid range 1-100
    if (parsedValue < 1 || parsedValue > 100) {
      throw new Error(`${parsedValue} percentage must be 1-100%`)
    }

    return Math.round(percentageToPixels(parsedValue, containerWidth))
  }

  if (isPixels) {
    const parsedValue = Number(value.toString().replace('px', '').trim())
    if (isNaN(parsedValue)) {
      throw new Error(`${parsedValue} value must be a number`)
    }

    return parsedValue
  }

  //Ensure no random text passes
  if (typeof value === 'string' && isNaN(Number(value))) {
    throw new Error(`${value} must be a number, percentage or px`)
  }

  return Number(value)
}
