import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Header, GridHeader, NestedHeader } from './types/header.type'
import { FixedColumnWidthDictionary } from './types/fixed-column-width-dictionary'
import { StretchMode } from '../types/stretch-mode.enum'
import { insertDummyCells } from '../gridWrapper/utils/insertDummyCells'
import { ApiRef, useApiExtends } from "../api";

export interface FixedColumnWidthRecord {
	totalSize: number
	mapping: FixedColumnWidthDictionary
}

export interface GetColumnAt {
	(index: number, row?: number): Header | undefined
}

interface HeadersState {
	headersData: GridHeader[][]
	dynamicColumnCount: number
	getColumnAt: GetColumnAt
}

interface Props {
	headers: Header[]
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
	headers,
	nestedHeaders,
	minColumnWidth,
	stretchMode,
	apiRef,
	initialised
}: Props): HeadersState {
	const headersRef = useRef<Header[]>(headers)

	const headersData: GridHeader[][] = useMemo(() => {
		headersRef.current = headers
		//Detect duplicated
		const duplicateColumns = headers.filter((column, i) => {
			return headers.findIndex(d => d.id === column.id) !== i
		})

		if (duplicateColumns.length) {
			throw new Error(
				`Duplicate columns were found with ids: "${duplicateColumns
					.map(d => d.id)
					.join(', ')}" in the columns array above`,
			)
		}

		//Validate % width to prevent overflow
		const totalWidth = headers.reduce((acc, e) => {
			if (e.width && typeof e.width === 'string' && e.width.includes('%')) {
				return acc + parseFloat(e.width)
			}
			return acc
		}, 0)

		if (totalWidth > 100) {
			throw new Error(
				`Column widths cannot pass 100%, please review your configuration. Received ${totalWidth}% out of 100%`,
			)
		}

		//Check and maybe validate if needed
		const transformedHeaders = headers.map(
			e =>
				({
					...e,
					colSpan: 0,
					isNested: false,
				} as GridHeader),
		)

		if (nestedHeaders) {
			//Check if any row passes the limit of spanning
			nestedHeaders.forEach((row, i) => {
				const spanSize = row.reduce((acc, e) => acc + (e.colSpan ?? 0), 0)
				if (spanSize > headers.length) {
					throw new Error(
						'Span size is bigger than the main headers size, please review the configuration at row: ' +
							i,
					)
				}
			})

			const nestedTransform = nestedHeaders.map(rows => {
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
			return insertDummyCells([...nestedTransform, transformedHeaders])
		}

		//Only one level is necessary
		return insertDummyCells([transformedHeaders])
	}, [headers, nestedHeaders])

	//Stores the amount of columns that we want to calculate using the remaining width of the grid
	const dynamicColumnCount = useMemo(() => {
		return headers.filter(e => !e.width).length
	}, [headers])

	const getColumnAt = useCallback(
		(index: number) => {
			return headersRef.current[index]
		},
		[],
	)

	useApiExtends(apiRef, {
		getColumnAt
	}, 'ColumnApi')
	return {
		headersData,
		dynamicColumnCount,
		getColumnAt,
	}
}
