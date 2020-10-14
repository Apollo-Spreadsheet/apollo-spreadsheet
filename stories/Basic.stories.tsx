import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { storiesOf } from '@storybook/react'
import { ApolloSpreadSheet } from '../src'
import { Button, Checkbox, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core'
import { GridApi } from '../src/types/grid-api.type'
import { GridTheme } from '../src/types/grid-theme'
import { makeStyles } from '@material-ui/core/styles'
import { StretchMode } from '../src/types/stretch-mode.enum'
import { NavigationCoords } from '../src/navigation/types/navigation-coords.type'
import { createMergeCellsData } from './createMergedCells'
import { CellChangeParams } from '../src/editorManager/useEditorManager'
import { getTopUseCase } from './dataUseCases'
import { getSimpleData } from './generateData'
import { orderBy } from 'lodash'
import { Alignment } from 'react-virtualized'

const LargeDataSetTable = () => {
	const { headerData, data } = getSimpleData(50, 50)

	return (
		<ApolloSpreadSheet
			headers={headerData}
			rows={data}
			fixedColumnCount={2}
			onCellChange={console.log}
			minColumnWidth={120}
		/>
	)
}

const useTopStyles = makeStyles(() => ({
	currentColumnClass: {
		color: '#225890',
	},
	currentColumnClassDark: {
		color: 'blue',
	},
	currentRowClass: {
		color: '#225890',
	},
	currentRowClassDark: {
		color: 'blue',
	},
	headerClass: {
		background: 'white !important' as any,
		border: 'none !important' as any,
		fontWeight: 700,
		fontSize: '11px',
	},
	headerClassDark: {
		background: 'white !important' as any,
		border: 'none !important' as any,
		fontWeight: 700,
		fontSize: '14px',
	},
	rowClass: {
		border: '1px solid white',
		backgroundColor: '#E6EFED',
		fontSize: '13px',
		/** @todo This section will be used for cell flashing effect when undo/redo
		 * but we need a setTimeout with equal time of the tranistion to remove the class
		 * **/
		// transition: "background-color 1s linear",
		// "&:hover": {
		//   backgroundColor: "red",
		// },
	},
	rowClassDark: {
		border: '1px solid white',
		backgroundColor: 'black',
		color: 'white',
	},
	disabledCellClass: {
		opacity: '0.6',
	},
	checkBox: {
		height: '10px',
		width: '10px',
	},
}))

const { headerData: topHeaders, data: topDefaultData } = getTopUseCase()
const MainTable = () => {
	const classes = useTopStyles()
	const [headers, setHeaders] = useState(topHeaders)
	const [data, setData] = useState(topDefaultData)
	const [outsideClickDeselects, setOutsideClickDeselect] = useState(true)
	const gridApi = useRef<GridApi | null>(null)
	const [darkTheme, setDarkTheme] = useState(false)
	const [selectionEnabled, setSelectionEnabled] = useState(true)
	const [scrollAlignment, setScrollAlignment] = useState<Alignment>('auto')

	const mergeCellsData = useMemo(() => {
		return createMergeCellsData(data, headers)
	}, [data, headers])

	const topDarkGridTheme: GridTheme = {
		currentColumnClass: classes.currentColumnClassDark,
		currentRowClass: classes.currentRowClassDark,
		headerClass: classes.headerClassDark,
		cellClass: classes.rowClassDark,
		disabledCellClass: classes.disabledCellClass,
	}

	const topLightGridTheme: GridTheme = {
		currentColumnClass: classes.currentColumnClass,
		currentRowClass: classes.currentRowClass,
		headerClass: classes.headerClass,
		disabledCellClass: classes.disabledCellClass,
		cellClass: classes.rowClass,
	}

	const onCellChange = useCallback(
		(changes: CellChangeParams) => {
			const newData = [...data]
			const column = headers[changes.coords.colIndex]
			newData[changes.coords.rowIndex] = {
				...newData[changes.coords.rowIndex],
				[column.accessor]: changes.newValue,
			}
			setData(newData)
		},
		[data, headers],
	)

	const createRow = (coords: NavigationCoords) => {
		const mergedCellInfo = mergeCellsData.find(
			e => e.rowIndex === coords.rowIndex && e.colIndex === coords.colIndex,
		)
		let newOrder = -1
		if (mergedCellInfo) {
			//need to be the original row + the rowspan + 1 because we want the next line (row starts at 0 and we want the next line but since rowspan adds one extra value we only add 1 instead of 2 )
			newOrder = coords.rowIndex + mergedCellInfo.rowSpan + 1
		}
		//add plus 2 because row starts at 0 and we want the next line
		newOrder = coords.rowIndex + 2

		const previousRow = data[newOrder - 1]
		console.log({ previousRow })
		console.error('Creating on newOrder = ' + newOrder)
		const updatedData = [...data]
		const newRow: any = {
			taskId: Math.random(),
			taskContent: 'Enter Task ' + newOrder,
			deliverableId: previousRow.deliverableId,
			deliverableBody: previousRow.deliverableBody,
			activityId: previousRow.activityId,
			activityBody: previousRow.activityBody,
			wpId: previousRow.wpId,
			wpBody: previousRow.wpBody,
			lok: 1,
			order: newOrder,
			startDate: '2020-10-07',
			endDate: '2020-10-07',
			materials: 0,
			dependencies: [],
			estimatedTime: 0,
			realTime: 0,
			status: 0,
			approved: 0,
			finishDate: null,
			allocated: [],
			extraCells: [],
		}
		updatedData.push(newRow)
		setData(updatedData)
	}

	const createRowOnBottom = () => {
		const updatedData = [...data]
		const newRow: any = {
			taskId: Math.random(),
			taskContent: 'Task ' + updatedData.length + 1,
			deliverableId: '5f7dcb38a805c1001777933d',
			deliverableBody: '',
			activityId: '5f7dcb38a805c1001777933f',
			activityBody: '',
			wpId: '5f7dcb38a805c1001777933e',
			wpBody: '',
			lok: 1,
			order: updatedData.length + 1,
			startDate: '2020-10-07',
			endDate: '2020-10-07',
			materials: 0,
			dependencies: [],
			estimatedTime: 0,
			realTime: 0,
			status: 0,
			approved: 0,
			finishDate: null,
			allocated: [],
			extraCells: [],
		}
		updatedData.push(newRow)
		setData(updatedData)
	}

	const onKeyDown = e => {
		if (e.key === 'Enter') {
			e.preventDefault()
			createRow(apiRef.current?.selectedCell)
		}
	}

	// useEffect(() => {
	// 	document.addEventListener('keydown', onKeyDown)
	// 	return () => document.removeEventListener('keydown', onKeyDown)
	// }, [])

	const onGridReady = useCallback(api => {
		gridApi.current = api
	}, [])

	const apiRef = useRef<any>(null)

	function handleScrollAlignmentChange(e) {
		setScrollAlignment(e.target.value)
	}

	function onHeaderIconClick() {
		const selectedRows = apiRef.current?.getSelectedRows() ?? []
		if (selectedRows.length === 0){
			return
		}
		console.warn(apiRef.current?.getSelectedRows())
		setData(data.filter(e => !selectedRows.some(id => id === e.taskId)))
	}

	return (
		<>
			<Button variant="contained" color={'primary'} onClick={createRowOnBottom}>
				Create row on bottom
			</Button>
			<Checkbox
				checked={outsideClickDeselects}
				onChange={e => setOutsideClickDeselect((e?.target as any).checked)}
			/>
			Deselect on click away
			<Checkbox checked={darkTheme} onChange={e => setDarkTheme((e?.target as any).checked)} />
			Dark Theme Test
			<Checkbox
				checked={selectionEnabled}
				onChange={e => setSelectionEnabled((e?.target as any).checked)}
			/>
			Toggle rowSelection hook
			<FormControl style={{ minWidth: 120 }}>
				<InputLabel id="demo-simple-select-label">Scroll Alignment</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={scrollAlignment}
					onChange={handleScrollAlignmentChange}
				>
					<MenuItem value={'auto'}>Auto (Default)</MenuItem>
					<MenuItem value={'center'}>Center</MenuItem>
					<MenuItem value={'start'}>Start</MenuItem>
					<MenuItem value={'end'}>End</MenuItem>
				</Select>
			</FormControl>
			<ApolloSpreadSheet
				ref={ref => {
					apiRef.current = ref
				}}
				headers={headers}
				rows={data}
				fixedColumnCount={2}
				onCellChange={onCellChange}
				outsideClickDeselects={outsideClickDeselects}
				onGridReady={onGridReady}
				theme={darkTheme ? topDarkGridTheme : topLightGridTheme}
				minRowHeight={25}
				minColumnWidth={10}
				stretchMode={StretchMode.All}
				mergeCells={mergeCellsData}
				// onKeyDown={e => {
				// 	if (e.key === 'Enter') {
				// 		e.preventDefault()
				// 		const coords = apiRef.current?.selectedCell as any
				// 		createRow(coords)
				// 	}
				// }}
				scrollToAlignment={scrollAlignment}
				selection={
					selectionEnabled
						? {
								key: 'taskId',
								checkboxClass: classes.checkBox,
								onHeaderIconClick
						  }
						: undefined
				}
			/>
		</>
	)
}
storiesOf('VirtualizedTable (DEMOS)', module)
	// .add('Large data set', () => <LargeDataSetTable />)
	.add('Main table', () => <MainTable />)
