import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { NavigationCoords } from '../navigation/types/navigation-coords.type'
import { validateMergeData } from './validateMergeData'
import { MergeCell } from './interfaces/merge-cell'
import { createMergedPositions, MergePosition } from "./createMergedPositions"
import { createMergedGroups, MergeGroup } from "./createMergedGroups"
import { useApiExtends } from "../api/useApiExtends"
import { ApiRef } from "../api/types/apiRef"
import { MergeCellsApi } from "../api/types"

export interface MergedCellsHookProps {
	mergeCells?: MergeCell[]
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
export function useMergeCells({ mergeCells, rowCount, columnCount, apiRef, initialised }: MergedCellsHookProps) {
	const mergedPositions = useRef<MergePosition[]>([])
	const mergeGroups = useRef<MergeGroup>({})
	const mergeData = useRef<MergeCell[]>([])
	useEffect(() => {
		if (!mergeCells){
			return
		}
		mergeData.current = validateMergeData(mergeCells, rowCount, columnCount)
		mergeGroups.current = createMergedGroups(mergeCells)
		mergedPositions.current = createMergedPositions(mergeCells)
	}, [mergeCells, rowCount, columnCount])


	const isMerged = useCallback(({ rowIndex, colIndex}: NavigationCoords) => {
		return mergedPositions.current.some(e => e.row === rowIndex && e.col === colIndex)
	}, [])


	/**
	 * Returns the whole path including all the children and the head as the parent
	 * @param coords
	 */
	const getMergedPath = useCallback((rowIndex: number) => {
		//First position is the parent OR the active if its the parent and the second is the child aka current
		const activeRowPath: number[] = []

		//Check if the target row exists in any group
		for (const [parentRow, childIndices] of Object.entries(mergeGroups.current)) {
			const isIncluded = childIndices.includes(rowIndex)
			if (isIncluded) {
				activeRowPath.push(Number(parentRow))
				activeRowPath.push(rowIndex)
				break
			}
		}
		return activeRowPath
	}, [])

	/**
	 * Returns the col/row span of the given colIndex/rowIndex
	 * @param coords
	 */
	const getSpanProperties = useCallback(
		(coords: NavigationCoords) => {
			return mergeData.current.find(e => e.rowIndex === coords.rowIndex && e.colIndex === coords.colIndex)
		},
		[],
	)

	const getMergedData = useCallback(() => mergeData.current, [])
	const getMergedGroups = useCallback(() => mergeGroups.current, [])

	const mergedCellsApi: MergeCellsApi = {
		getSpanProperties,
		isMerged,
		getMergedPath,
		getMergedData,
		getMergedGroups
	}

	useApiExtends(apiRef, mergedCellsApi, 'MergeCellsAPI')
}
