/**
 * Ensures the value is at least an empty cell value if is not a valid dom element
 * @param value
 */
export const formatCellValue = (value: unknown) => {
	if (typeof value === 'object' || Array.isArray(value) || value === undefined || value === null) {
		return ''
	}
	return String(value)
}
