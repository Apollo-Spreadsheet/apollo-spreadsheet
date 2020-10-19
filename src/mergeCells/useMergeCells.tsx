import React, { useCallback, useEffect, useMemo } from 'react'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'
import { validateMergeData } from './validateMergeData'
import { MergeCell } from './interfaces/merge-cell'
import { createMergedPositions } from './createMergedPositions'
import { createMergedGroups } from "./createMergedGroups";

export interface MergedCellsHookData {
	data?: MergeCell[]
	rowCount: number
	columnCount: number
}

/**
 * Provides validation for merged data, handles the lookup with navigation coordinates and
 * return util functions
 * @param data
 */
export function useMergeCells({ data, rowCount, columnCount }: MergedCellsHookData) {
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

	/**
	 * Checks whether the given coordinates are within a merge or they are a merge
	 */
	const isMerged = useCallback(({ rowIndex, colIndex}: NavigationCoords) => {
		return mergedPositions?.some(e => e.row === rowIndex && e.col === colIndex)
	}, [mergedPositions])


	const isHorizontallyMerged = () => {
		return false
	}

	const isVerticallyMerged = () => {
		return false
	}

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
		return []
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

	return {
		mergeData,
		isMerged,
		getMergedPath,
		getSpanProperties,
		mergedPositions,
	}
}
