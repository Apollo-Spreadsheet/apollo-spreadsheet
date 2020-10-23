import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alignment } from 'react-virtualized'
import { createMergeCellsData } from './createMergedCells'
import { GridTheme } from '../../../src/types/grid-theme'
import { CellChangeParams } from '../../../src/editorManager/useEditorManager'
import { NavigationCoords } from '../../../src/navigation/types/navigation-coords.type'
import { orderBy } from 'lodash'
import { Box, Button, Checkbox, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core'
import { ApolloSpreadSheet } from '../../../src'
import { StretchMode } from '../../../src/types/stretch-mode.enum'
import { useTopCase } from './dataUseCases'
import { makeStyles } from '@material-ui/core/styles'
import { useApiRef } from '../../../src/api/useApiRef'
import 'react-datepicker/dist/react-datepicker.css'

const useStyles = makeStyles(theme => ({
	root: {
		margin: 10,
	},
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
		background: 'white',
		border: 'none',
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
	calendarClass: {
		color: theme.palette.type === 'dark' ? '#fff' : '#4d4d4d',
		backgroundColor: theme.palette.type === 'dark' ? '#121212' : '#fff',
		'& .react-datepicker__header': {
			backgroundColor: theme.palette.type === 'dark' ? '#121212' : '#fff',
		},
		'& .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header': {
			color: theme.palette.type === 'dark' ? '#fff' : '#47956A',
		},
		'& .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name': {
			color: theme.palette.type === 'dark' ? '#fff' : '#808080',
			borderRadius: '20px',
			'&:hover': {
				transform: 'scale(1.07)',
			},
		},
		'& .react-datepicker__day--disabled, .react-datepicker__month-text--disabled, .react-datepicker__quarter-text--disabled': {
			color: theme.palette.type === 'dark' ? 'black' : '#ccc',
			cursor: 'default',
		},
		'& .react-datepicker__day--selected ': {
			backgroundColor: '#77C698',
			color: '#fff',
			borderRadius: '20px',
		},
	},
}))

export function Spreadsheet() {
	const classes = useStyles()
	const { headerData: headers, data: defaultData } = useTopCase(classes.calendarClass)
	const [data, setData] = useState(defaultData)
	const [outsideClickDeselects, setOutsideClickDeselect] = useState(true)
	const [darkTheme, setDarkTheme] = useState(false)
	const [selectionEnabled, setSelectionEnabled] = useState(true)
	const [scrollAlignment, setScrollAlignment] = useState<Alignment>('auto')
	const apiRef = useApiRef()

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
			setData(prev => {
				const newData = [...prev]
				const column = headers[changes.coords.colIndex]
				newData[changes.coords.rowIndex] = {
					...newData[changes.coords.rowIndex],
					[column.accessor]: changes.newValue,
				}
				return newData
			})
		},
		[data, headers],
	)

	const [delayedPosition, setDelayedPosition] = useState<NavigationCoords | null>(null)

	function createRow(coords: NavigationCoords) {
		const mergedCellInfo = mergeCellsData.find(
			e => e.rowIndex === coords.rowIndex && e.colIndex === coords.colIndex,
		)
		let newOrder = -1
		if (mergedCellInfo) {
			//need to be the original row + the rowspan + 1 because we want the next line (row starts at 0 and we want the next line but since rowspan adds one extra value we only add 1 instead of 2 )
			newOrder = coords.rowIndex + mergedCellInfo.rowSpan + 1
		} else {
			//add plus 2 because row starts at 0 and we want the next line
			newOrder = coords.rowIndex + 2
		}

		const parentRow = data[coords.rowIndex]
		const updatedData = [...data]
		const newRow: any = {
			taskId: 'new-task' + Math.random().toString(),
			taskContent: 'New task from enter',
			deliverableId: parentRow ? parentRow.deliverableId : 'new-del-' + Math.random().toString(),
			deliverableBody: parentRow ? parentRow.deliverableBody : 'New DEL',
			activityId: parentRow ? parentRow.activityId : 'new-act-' + Math.random().toString(),
			activityBody: parentRow ? parentRow.activityBody : 'New ACT',
			wpId: parentRow ? parentRow.wpId : 'new-wp-' + Math.random().toString(),
			wpBody: parentRow ? parentRow.wpBody : 'New WP',
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

		updatedData.splice(newOrder - 1, 0, newRow)
		const sortedRows = orderBy(updatedData, ['order'], ['asc'])

		let sortOrder = 1
		for (const row of sortedRows) {
			row.order = sortOrder
			sortOrder++
		}
		setData(sortedRows)
		if (!parentRow) {
			setDelayedPosition({ rowIndex: newOrder - 1, colIndex: coords.colIndex })
		}
	}

	//Update the schedule position after we create a new row (DEMO)
	useEffect(() => {
		if (!delayedPosition) {
			return
		}
		apiRef.current.selectCell(delayedPosition)
		setDelayedPosition(null)
	}, [delayedPosition])

	const createRowOnBottom = () => {
		const updatedData = [...data]
		const newRow: any = {
			taskId: 'task-' + Math.random().toString(),
			taskContent: 'Task ' + updatedData.length + 1,
			deliverableId: 'del-' + Math.random().toString(),
			deliverableBody: 'New Del',
			activityId: 'act-' + Math.random().toString(),
			activityBody: 'New Act',
			wpId: 'wp-' + Math.random().toString(),
			wpBody: 'New WP',
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

	function handleScrollAlignmentChange(e) {
		setScrollAlignment(e.target.value)
	}

	function onHeaderIconClick() {
		const selectedRows = apiRef.current?.getSelectedRowIds() ?? []
		if (selectedRows.length === 0) {
			return
		}
		setData(data.filter(e => !selectedRows.some(id => id === e.taskId)))
	}

	return (
		<Box height={'400px'} width={'99%'}>
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
				className={classes.root}
				apiRef={apiRef}
				columns={headers}
				rows={data}
				onCellChange={onCellChange}
				outsideClickDeselects={outsideClickDeselects}
				theme={darkTheme ? topDarkGridTheme : topLightGridTheme}
				minRowHeight={25}
				minColumnWidth={10}
				stretchMode={StretchMode.All}
				mergeCells={mergeCellsData}
				scrollToAlignment={scrollAlignment}
				onCreateRow={createRow}
				selection={
					selectionEnabled
						? {
								key: 'taskId',
								checkboxClass: classes.checkBox,
								onHeaderIconClick,
						  }
						: undefined
				}
			/>
		</Box>
	)
}
