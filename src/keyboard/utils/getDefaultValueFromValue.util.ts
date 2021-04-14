/**
 * Returns a default value according to the given value type
 * @param value
 */
export const getDefaultValueFromValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return []
  }
  if (typeof value === 'string') {
    return ''
  }
  if (typeof value === 'number') {
    return 0
  }

  return undefined
}
