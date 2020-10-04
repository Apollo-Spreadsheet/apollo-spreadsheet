import React, { useCallback, useEffect, useRef, useState } from 'react'
import { storiesOf } from '@storybook/react'

import { ApolloSpreadSheet } from '../index'
import { getSimpleData } from './generateData'
import { CellChangeParams } from '../core/GridWrapper'
import { Button, Checkbox, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core'
import { IGridApi } from '../types/grid-api.type'
import { getTopUseCase } from './dataUseCases'
import { Row } from '../types/row.interface'
import { GridTheme } from '../types/grid-theme'
import { makeStyles } from '@material-ui/core/styles'
import { StretchMode } from '../types/stretch-mode.enum'

const LargeDataSetTable = () => {
	const { headerData, data } = getSimpleData(50, 50)

	return (
		<ApolloSpreadSheet
			headers={headerData}
			data={data}
			fixedColumnCount={2}
			onCellChange={console.log}
			minColumnWidth={120}
		/>
	)
}

const { headerData: topHeaders, data: topDefaultData } = getTopUseCase()
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
}))
const MainTable = () => {
	const [headers, setHeaders] = useState(topHeaders)
	const [data, setData] = useState(topDefaultData)
	const [suppressNavigation, setSuppressNavigation] = useState(false)
	const [outsideClickDeselects, setOutsideClickDeselect] = useState(true)
	// const [gridStatus, setGridStatus] = useState("Mounting");
	const classes = useTopStyles()
	const gridApi = useRef<IGridApi | null>(null)
	const [darkTheme, setDarkTheme] = useState(false)

	const [stretchMode, setStrechMode] = React.useState(StretchMode.All)

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		setStrechMode(event.target.value as any)
	}

	const topDarkGridTheme: GridTheme = {
		currentColumnClass: classes.currentColumnClassDark,
		currentRowClass: classes.currentRowClassDark,
		headerClass: classes.headerClassDark,
		rowClass: classes.rowClassDark,
	}

	const topLightGridTheme: GridTheme = {
		currentColumnClass: classes.currentColumnClass,
		currentRowClass: classes.currentRowClass,
		headerClass: classes.headerClass,
		rowClass: classes.rowClass,
	}

	const onCellChange = useCallback(
		(changes: CellChangeParams) => {
			const newData = [...data]
			/** @todo Ofc this is temporary the index must come normalized **/
			newData[changes.rowIndex][changes.columnIndex === 0 ? 0 : changes.columnIndex - 1] = {
				...newData[changes.rowIndex][changes.columnIndex],
				children: changes.value,
			}
			setData(newData)
		},
		[data],
	)

	const insert = (arr, index, newItem) => [...arr.slice(0, index), newItem, ...arr.slice(index)]

	// const createRow = () => {
	//   const coords = (tableRef.current as any)?.getCoords() as any;
	//   const parentRow = data[coords.rowIndex];
	//   let updatedRows = [...data];
	//   const newRow: any[] = [];
	//   //Check if is merged because we need the parent to add more rowSpan in case this task goes to any merged cell
	//
	//   for (const cell of parentRow) {
	//     if (cell.rowSpan && cell.rowSpan > 1) {
	//       console.error(cell);
	//     } else {
	//       newRow.push({
	//         id: "test-new-" + Math.random(),
	//         children: "New - " + cell.id,
	//       });
	//     }
	//   }
	//   updatedRows = insert(updatedRows, coords.rowIndex + 1, newRow);
	//   setData(updatedRows);
	// };
	const createRowOnBottom = () => {
		const updatedData = [...data]
		const newRow: Row = [
			{
				id: 'new-' + Math.random(),
				children: 'Deliverable new',
			},
			{
				id: 'wp-' + Math.random(),
				children: 'WP new',
			},
			{
				id: 'act-' + Math.random(),
				children: 'Activity new',
			},
			{
				id: 'or-' + Math.random(),
				children: '1',
			},
			{
				id: 't-' + Math.random(),
				children: 'New task',
			},
			{
				id: 'dp-' + Math.random(),
				children: '[]',
			},
			{
				id: 'est-' + Math.random(),
				children: '0',
			},
			{
				id: 'real-' + Math.random(),
				children: '0',
			},
			{
				id: 'allocated-' + Math.random(),
				children: '',
			},
			{
				id: 'materials-' + Math.random(),
				children: '0',
			},
			{
				id: 'startDate-' + Math.random(),
				children: '',
			},
			{
				id: 'endDate-' + Math.random(),
				children: '',
			},
			{
				id: 'taskControl-' + Math.random(),
				children: '',
			},
			{
				id: 'delete-' + Math.random(),
				children: 'the trash',
			},
		]
		updatedData.push(newRow)
		setData(updatedData)
	}

	const onKeyDown = e => {
		if (e.key === 'Enter') {
			e.preventDefault()
			// createRow();
		}
	}

	useEffect(() => {
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [gridApi.current])

	const onGridReady = useCallback(api => {
		gridApi.current = api
	}, [])

	// const exportCSV = useCallback(e => {
	//   e.preventDefault()
	//   console.error("Building a simple thing")
	// }, [data, headers])

	// const testRow: TestRow = {
	//   id: "1234",
	//   deliverableId: "string",
	//   deliverableBody:"string",
	//   wpId: "string",
	//   wpBody: "string",
	//   activityId: "string",
	//   activityBody: "string",
	//   order: 1,
	//   taskId: "string",
	//   taskBody: "string"
	// }
	// console.log(buildCellFromHeader(testRow, headers[0]))
	return (
		<>
			{/*<Button variant="contained" color={"secondary"} onClick={exportCSV}>*/}
			{/*  CSV Export*/}
			{/*</Button>*/}
			<Button variant="contained" color={'primary'} onClick={createRowOnBottom}>
				Create row on bottom
			</Button>
			<Checkbox checked={outsideClickDeselects} onChange={e => setOutsideClickDeselect((e?.target as any).checked)} />
			Deselect on click away
			<Checkbox checked={darkTheme} onChange={e => setDarkTheme((e?.target as any).checked)} />
			Dark Theme Test
			<FormControl>
				<InputLabel id="demo-simple-select-label">StretchMode</InputLabel>
				<Select labelId="demo-simple-select-label" id="demo-simple-select" value={stretchMode} onChange={handleChange}>
					<MenuItem value={StretchMode.None}>None</MenuItem>
					<MenuItem value={StretchMode.All}>All</MenuItem>
					<MenuItem value={StretchMode.Last}>Last</MenuItem>
				</Select>
			</FormControl>
			<ApolloSpreadSheet
				headers={headers}
				data={data}
				fixedColumnCount={2}
				onCellChange={onCellChange}
				outsideClickDeselects={outsideClickDeselects}
				suppressNavigation={suppressNavigation}
				onGridReady={onGridReady}
				theme={darkTheme ? topDarkGridTheme : topLightGridTheme}
				minRowHeight={50}
				minColumnWidth={10}
				stretchMode={stretchMode}
				// minColumnHeight={25}
			/>
		</>
	)
}
storiesOf('VirtualizedTable (DEMOS)', module)
	.add('Large data set', () => <LargeDataSetTable />)
	.add('Main table', () => <MainTable />)
