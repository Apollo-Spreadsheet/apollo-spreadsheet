import React, { useState } from "react";
import { ApolloSpreadSheet, StretchMode } from "../../../src";
import { Header } from "../../../src/columnGrid/types/header.type";
import { AddCircle } from "@material-ui/icons";
import { Box, IconButton } from "@material-ui/core";
import { CellChangeParams } from "../../../src/editorManager/useEditorManager";
import { useApiRef } from "../../../src/api/useApiRef";

interface DemoRow {
	id: string
	name: string
	city: string
	country: string
	job: string
	order: number
}

const defaultRow: DemoRow = {
	id: '',
	name: '',
	city: '',
	country: '',
	job: '',
	order: 1,
}
export function Table() {
	const [rows, setRows] = useState<DemoRow[]>([defaultRow])
	const apiRef = useApiRef()
	const onHeaderIconClick = () => {
		const selectedRows = apiRef.current?.getSelectedRows() ?? []
		if (selectedRows.length === 0) {
			return
		}
		setRows(rows.filter(e => !selectedRows.some(id => id === e.id)))
	}

	function disableSort(header: Header) {
		return header.id === 'order'
	}
	const onCellChange = (params: CellChangeParams) => {
		setRows(prev => {
			const updatedRows = [...prev]
			const header = headers[params.coords.colIndex]
			updatedRows[params.coords.rowIndex] = {
				...updatedRows[params.coords.rowIndex],
				[header?.accessor]: params.newValue,
			}
			return updatedRows
		})
	}

	const onCreateRowClick = () => {
		setRows(prev => [
			...prev,
			{
				id: 'r-' + Math.random(),
				name: '',
				city: '',
				country: '',
				job: '',
				order: prev.length + 1,
			},
		])
	}

	const headers: Header[] = [
		{
			id: 'order',
			title: '',
			accessor: 'order',
			readOnly: true,
			tooltip: 'Create your new row',
			disableBackspace: true,
			disableCellCut: true,
			disableCellPaste: true,
			width: '3%',
			renderer: () => {
				return (
					<IconButton onClick={onCreateRowClick}>
						<AddCircle />
					</IconButton>
				)
			},
		},
		{
			id: 'name',
			title: 'Name',
			accessor: 'name',
			width: '20%',
		},
		{
			id: 'city',
			title: 'City',
			accessor: 'city',
			width: '20%',
		},
		{
			id: 'country',
			title: 'Country',
			accessor: 'country',
		},
	]

	return (
		<Box width={'98%'} height={'400px'} style={{ margin: 10 }}>
			<ApolloSpreadSheet
				apiRef={apiRef}
				headers={headers}
				rows={rows}
				onCellChange={onCellChange}
				onCreateRow={onCreateRowClick}
				minColumnWidth={30}
				minRowHeight={30}
				stretchMode={StretchMode.None}
				selection={{
					key: 'id',
					onHeaderIconClick,
				}}
				disableSort={disableSort}
				nestedHeaders={[
					[
						{
							title: 'Nested header example',
							colSpan: 5,
						},
					],
				]}
			/>
		</Box>
	)
}
