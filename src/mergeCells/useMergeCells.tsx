import React, { useCallback, useEffect, useMemo } from 'react'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'
import { validateMergeData } from './validateMergeData'
import { MergeCell } from './interfaces/merge-cell'
import { createMergedPositions } from './createMergedPositions'

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
	const { mergeData, mergedPositions } = useMemo(() => {
		if (!data) {
			return {
				mergeData: [],
				mergedPositions: [],
			}
		}
		//Dispatches an error when a bad merge is found
		const validatedData = validateMergeData(data, rowCount, columnCount)
		const mergedPositions = createMergedPositions(validatedData)
		return {
			mergeData: validatedData,
			mergedPositions,
		}
	}, [data])

	/**
	 * Checks whether the given coordinates are within a merge or they are a merge
	 */
	const isMerged = (coords: NavigationCoords) => {
		return true
	}

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
	const getMergedPath = (coords: NavigationCoords) => {
		return []
	}

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
