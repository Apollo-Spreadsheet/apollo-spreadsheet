import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Header, GridHeader, NestedHeader } from './types/header.type'
import { FixedColumnWidthDictionary } from './types/fixed-column-width-dictionary'
import { StretchMode } from '../types/stretch-mode.enum'
import { insertDummyCells } from '../gridWrapper/utils/insertDummyCells'

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
}: Props): HeadersState {
	const headersData: GridHeader[][] = useMemo(() => {
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
		(index: number, row = 0) => {
			return headersData[row]?.[index]
		},
		[headersData],
	)

	return {
		headersData,
		dynamicColumnCount,
		getColumnAt,
	}
}
