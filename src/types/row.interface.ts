/**
 * Public interface to seed row data
 */
export interface Cell<Key = string> {
	id: Key
	/** @todo Remove this, the header using cellRenderer or plain data with acessor controls the content **/
	children: any
	rowSpan?: number
	colSpan?: number
}

/**
 * Internal grid row interface to identify merged cells and handle
 * internal states
 */
export interface GridCell extends Cell {
	parentRow?: Cell
	style?: any
	gridType?: string
	dummy?: boolean
	dummyFor?: string
}

export type GridRow = Array<GridCell>
export type Row = Array<Cell>
export type GridData = Array<Row>
