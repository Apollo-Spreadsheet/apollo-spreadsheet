import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Column, GridHeader, NestedHeader } from './types/header.type'
import { FixedColumnWidthDictionary } from './types/fixed-column-width-dictionary'
import { StretchMode } from '../types/stretch-mode.enum'
import { insertDummyCells } from '../gridWrapper/utils/insertDummyCells'
import { ApiRef, COLUMNS_CHANGED, useApiExtends } from '../api'
import { ColumnApi } from '../api/types/columnApi'

export interface FixedColumnWidthRecord {
	totalSize: number
	mapping: FixedColumnWidthDictionary
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
	initialised: boolean
}

/**
 * useHeaders manage the column configurations, parses and validates but also expose util methods necessary for the
 * creation of the headers
 * @todo Unit tests
 * @param headers
 * @param nestedHeaders
 * @param minColumnWidth
 * @param stretchMode
 */
export function useHeaders({
	columns,
	nestedHeaders,
	minColumnWidth,
	stretchMode,
	apiRef,
	initialised,
}: Props): HeadersState {
	const columnsRef = useRef<Column[]>(columns)
	const nestedHeadersRef = useRef<NestedHeader[][] | undefined>(nestedHeaders)
	const [gridHeaders, setGridHeaders] = useState<GridHeader[][]>([[]])

	function createGridHeaders({
		columns: paramColumns,
		nestedHeaders: paramNestedHeaders,
	}: {
		columns: Column[]
		nestedHeaders?: Array<NestedHeader[]>
	}) {
		//Detect duplicated
		const duplicateColumns = paramColumns.filter((column, i) => {
			return paramColumns.findIndex(d => d.id === column.id) !== i
		})

		if (duplicateColumns.length) {
			throw new Error(
				`Duplicate columns were found with ids: "${duplicateColumns
					.map(d => d.id)
					.join(', ')}" in the columns array above`,
			)
		}

		//Validate % width to prevent overflow
		const totalWidth = paramColumns.reduce((acc, e) => {
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
		const transformedHeaders = paramColumns.map(
			e =>
				({
					...e,
					colSpan: 0,
					isNested: false,
				} as GridHeader),
		)

		if (paramNestedHeaders) {
			//Check if any row passes the limit of spanning
			paramNestedHeaders.forEach((row, i) => {
				const spanSize = row.reduce((acc, e) => acc + (e.colSpan ?? 0), 0)
				if (spanSize > columns.length) {
					throw new Error(
						'Span size is bigger than the main headers size, please review the configuration at row: ' +
							i,
					)
				}
			})

			const nestedTransform = paramNestedHeaders.map(rows => {
				return rows.map(
					(e, i) =>
						({
							id: `nested-${i}`, //Doesn't matter that much
							accessor: '',
							title: e.title,
							colSpan: e.colSpan,
							className: e.className,
							isNested: true,
						} as GridHeader),
				)
			})

			//Here we combine with headers and insert the dummy cells
			return setGridHeaders(insertDummyCells([...nestedTransform, transformedHeaders]))
		}

		//Only one level is necessary
		setGridHeaders(insertDummyCells([transformedHeaders]))
	}

	const updateColumns = useCallback(
		(updatedColumns: Column[]) => {
			columnsRef.current = updatedColumns
			createGridHeaders({ columns: updatedColumns, nestedHeaders: nestedHeadersRef.current })
			apiRef.current.dispatchEvent(COLUMNS_CHANGED, { columns: updatedColumns })
		},
		[apiRef],
	)

	useEffect(() => {
		columnsRef.current = columns
		nestedHeadersRef.current = nestedHeaders
		createGridHeaders({ columns: columns, nestedHeaders })
		//TODO review if this might give us trouble in case of only nested headers changing
		apiRef.current.dispatchEvent(COLUMNS_CHANGED, { columns: columns })
	}, [columns, nestedHeaders])

	//Stores the amount of columns that we want to calculate using the remaining width of the grid
	const dynamicColumnCount = useMemo(() => {
		return columns.filter(e => !e.width).length
	}, [columns])

	const getColumnAt = useCallback((index: number) => {
		return columnsRef.current[index]
	}, [])

	const getColumnById = useCallback((id: string) => {
		return columnsRef.current.find(e => e.id === id)
	}, [])

	const getColumnCount = useCallback(() => {
		return columnsRef.current.length
	}, [])

	const getColumns = useCallback(() => columnsRef.current, [])

	const columnApi: ColumnApi = {
		getColumnAt,
		getColumnCount,
		getColumnById,
		updateColumns,
		getColumns,
	}

	useApiExtends(apiRef, columnApi, 'ColumnApi')

	return {
		gridHeaders,
		columns: columnsRef.current,
	}
}
