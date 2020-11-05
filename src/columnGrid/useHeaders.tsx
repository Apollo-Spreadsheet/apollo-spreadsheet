import { useCallback, useEffect, useRef, useState } from 'react'
import { Column, GridHeader, NestedHeader, ColumnWidthDictionary } from './types'
import { StretchMode } from '../types'
import { insertDummyCells } from '../gridWrapper/utils'
import { ApiRef, COLUMNS_CHANGED, useApiExtends } from '../api'
import { ColumnApi } from '../api/types/columnApi'
import { useLogger } from '../logger'
import { ROW_SELECTION_HEADER_ID, SelectionProps } from '../rowSelection'
import { createSelectionColumn } from '../rowSelection/createSelectionColumn'

export interface ColumnWidthRecord {
	totalSize: number
	mapping: ColumnWidthDictionary
}

export interface GetColumnAt {
	(index: number, row?: number): Column | undefined
}

interface HeadersState {
	gridHeaders: GridHeader[][]
	columns: Column[]
}

interface Props {
	columns: Column[]
	nestedHeaders?: Array<NestedHeader[]>
	minColumnWidth: number
	stretchMode?: StretchMode
	apiRef: ApiRef
	selection?: SelectionProps
	initialised: boolean
}

/**
 * useHeaders manage the column configurations, parses
 * and validates but also expose util methods necessary for the creation of the headers
 * @todo Unit tests
 * @param headers
 * @param nestedHeaders
 * @param minColumnWidth
 * @param stretchMode
 */
export function useHeaders({ columns, nestedHeaders, apiRef, selection }: Props): HeadersState {
	const logger = useLogger('useHeaders')
	const columnsRef = useRef<Column[]>(columns)
	const nestedHeadersRef = useRef<NestedHeader[][] | undefined>(nestedHeaders)
	const [gridHeaders, setGridHeaders] = useState<GridHeader[][]>([[]])

	const createGridHeaders = useCallback(
		({
			columns: paramColumns,
			nestedHeaders: paramNestedHeaders,
		}: {
			columns: Column[]
			nestedHeaders?: Array<NestedHeader[]>
		}) => {
			logger.debug('Creating grid headers.')
			const newColumns = [...paramColumns]
			//Selection column
			const selectionExists = newColumns.some(e => e.id === ROW_SELECTION_HEADER_ID)
			if (selection && !selectionExists) {
				logger.debug('Creating the selection header.')
				newColumns.push(createSelectionColumn(selection))
				columnsRef.current = newColumns
			}

			//Detect duplicated
			const duplicateColumns = newColumns.filter((column, i) => {
				return newColumns.findIndex(d => d.id === column.id) !== i
			})

			if (duplicateColumns.length) {
				throw new Error(
					`Duplicate columns were found with ids: "${duplicateColumns
						.map(d => d.id)
						.join(', ')}" in the columns array above`,
				)
			}

			//Validate % width to prevent overflow
			const totalWidth = newColumns.reduce((acc, e) => {
				if (e.width && typeof e.width === 'string' && e.width.includes('%')) {
					return acc + parseFloat(e.width.replace('%', '').trim())
				}
				return acc
			}, 0)

			if (totalWidth > 100) {
				throw new Error(
					`Column widths cannot pass 100%, please review your configuration. Received ${totalWidth}% out of 100%`,
				)
			}

			//Check and maybe validate if needed
			const transformedHeaders = newColumns.map(
				e =>
					({
						...e,
						colSpan: 0,
						isNested: false,
					} as GridHeader),
			)

			if (paramNestedHeaders) {
				logger.debug('Grid detected nested headers.')
				//Check if any row passes the limit of spanning
				paramNestedHeaders.forEach((row, i) => {
					const spanSize = row.reduce((acc, e) => acc + (e.colSpan ?? 0), 0)
					if (spanSize > columns.length) {
						throw new Error(
							`Span size is bigger than the main headers size, please review the configuration at row: ${i}`,
						)
					}
				})

				const nestedTransform = paramNestedHeaders.map(rows =>
					rows.map(
						(e, i) =>
							({
								id: `nested-${i}`, //Doesn't matter that much
								accessor: '',
								title: e.title,
								colSpan: e.colSpan,
								className: e.className,
								isNested: true,
							} as GridHeader),
					),
				)

				//Here we combine with headers and insert the dummy cells
				return setGridHeaders(insertDummyCells([...nestedTransform, transformedHeaders]))
			}

			//Only one level is necessary
			setGridHeaders(insertDummyCells([transformedHeaders]))
		},
		[columns, logger, selection],
	)

	const updateColumns = useCallback(
		(updatedColumns: Column[]) => {
			logger.debug('Updating columns.')
			columnsRef.current = updatedColumns
			createGridHeaders({ columns: updatedColumns, nestedHeaders: nestedHeadersRef.current })
			apiRef.current.dispatchEvent(COLUMNS_CHANGED, { columns: updatedColumns })
		},
		[apiRef, createGridHeaders, logger],
	)

	useEffect(() => {
		columnsRef.current = columns
		nestedHeadersRef.current = nestedHeaders
		createGridHeaders({ columns, nestedHeaders })
		//TODO review if this might give us trouble in case of only nested headers changing
		apiRef.current.dispatchEvent(COLUMNS_CHANGED, { columns })
	}, [apiRef, columns, createGridHeaders, nestedHeaders])

	const getColumnAt = useCallback((index: number) => columnsRef.current[index], [])

	const getColumnById = useCallback((id: string) => columnsRef.current.find(e => e.id === id), [])

	const getColumnCount = useCallback(() => columnsRef.current.length, [])

	const getColumns = useCallback(() => columnsRef.current, [])
	const getColumnIndex = useCallback((id: string) => columnsRef.current.findIndex(e => e.id === id), [])
	const columnApi: ColumnApi = {
		getColumnAt,
		getColumnCount,
		getColumnById,
		updateColumns,
		getColumns,
		getColumnIndex
	}

	useApiExtends(apiRef, columnApi, 'ColumnApi')

	return {
		gridHeaders,
		columns: columnsRef.current,
	}
}
