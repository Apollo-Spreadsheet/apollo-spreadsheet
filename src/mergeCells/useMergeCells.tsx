import React, { useCallback, useEffect, useMemo } from 'react'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'
import { validateMergeData } from './validateMergeData'
import { MergeCell } from './interfaces/merge-cell'
import { createMergedPositions } from './createMergedPositions'
import { createMergedGroups } from "./createMergedGroups"
import { useApiExtends } from "../api/useApiExtends"
import { ApiRef } from "../api/types/apiRef"

export interface MergedCellsHookProps {
	data?: MergeCell[]
	rowCount: number
	columnCount: number
	apiRef: ApiRef
	initialised: boolean
}

/**
 * Provides validation for merged data, handles the lookup with navigation coordinates and
 * return util functions
 * @param data
 */
export function useMergeCells({ data, rowCount, columnCount, apiRef, initialised }: MergedCellsHookProps) {
	const { mergeData, mergedPositions, mergeGroups } = useMemo(() => {
		if (!data) {
			return {
				mergeData: [],
				mergedPositions: [],
				mergeGroups: {}
			}
		}
		//Dispatches an error when a bad merge is found
		const validatedData = validateMergeData(data, rowCount, columnCount)
		const mergedPositions = createMergedPositions(validatedData)
		const mergeGroups = createMergedGroups(validatedData)
		return {
			mergeData: validatedData,
			mergedPositions,
			mergeGroups
		}
	}, [data])

	const isMerged = useCallback(({ rowIndex, colIndex}: NavigationCoords) => {
		return mergedPositions?.some(e => e.row === rowIndex && e.col === colIndex)
	}, [mergedPositions])


	/**
	 * Returns the whole path including all the children and the head as the parent
	 * @param coords
	 */
	const getMergedPath = useCallback((rowIndex: number) => {
		//First position is the parent OR the active if its the parent and the second is the child aka current
		const activeRowPath: number[] = []

		//Check if the target row exists in any group
		for (const [parentRow, childIndices] of Object.entries(mergeGroups)) {
			const isIncluded = childIndices.includes(rowIndex)
			if (isIncluded) {
				activeRowPath.push(Number(parentRow))
				activeRowPath.push(rowIndex)
				break
			}
		}
		return activeRowPath
	}, [mergeGroups])

	/**
	 * Returns the col/row span of the given colIndex/rowIndex
	 * @param coords
	 */
	const getSpanProperties = useCallback(
		(coords: NavigationCoords) => {
			return mergeData.find(e => e.rowIndex === coords.rowIndex && e.colIndex === coords.colIndex)
		},
		[mergeData],
	)

	const getMergedData = useCallback(() => mergeData, [mergeData])
	const getMergedGroups = useCallback(() => mergeGroups, [mergeGroups])

	useApiExtends(apiRef, {
		getSpanProperties,
		isMerged,
		getMergedPath,
		getMergedData,
		getMergedGroups
	}, 'MergeCellsAPI')

	return {
		mergeData,
		isMerged,
		getMergedPath,
		getSpanProperties,
		mergedPositions,
	}
}
