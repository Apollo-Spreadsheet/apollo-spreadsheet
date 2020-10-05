export interface MergedCell {
	rowIndex: number
	colIndex: number
	colSpan?: number
	rowSpan?: number
}

export type MergedData = Array<MergedCell>
