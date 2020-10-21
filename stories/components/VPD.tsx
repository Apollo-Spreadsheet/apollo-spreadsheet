import React, { useRef, useState } from 'react'
import { ApolloSpreadSheet } from '../../src'
import { AddCircle } from '@material-ui/icons'
import { Avatar, Box, IconButton, LinearProgress } from '@material-ui/core'
import { Header } from '../../src/columnGrid/types/header.type'
import faker from 'faker'
import { makeStyles } from '@material-ui/core/styles'

interface VpdRow {
	id: string
	name: string
	spi: number
	cpi: number
	time: number
	status: number
}

const generateFakeData = () => {
	const entries = 50
	const rows: VpdRow[] = []
	for (let i = 0; i <= entries; i++) {
		rows.push({
			id: faker.random.uuid(),
			name: faker.name.findName(),
			spi: faker.random.number({ min: 0.1, max: 2 }),
			cpi: faker.random.number({ min: 0.1, max: 2 }),
			time: faker.random.number({ min: 1, max: 100 }),
			status: faker.random.number({ min: 1, max: 5 }),
		})
	}
	return rows
}
const rows = generateFakeData()

function getStatusColor(status: number) {
	switch (status) {
		case 1:
			return 'blue'
		case 2:
			return 'green'
		case 3:
			return 'red'
		case 4:
			return 'orange'
		case 5:
			return 'grey'
		default:
			return 'black'
	}
}

function getStatusText(status: number) {
	switch (status) {
		case 1:
			return 'On schedule'
		case 2:
			return 'Out of Control'
		case 3:
			return 'On overrun'
		case 4:
			return 'On good standing'
		case 5:
			return 'Padding'
		default:
			return 'Invalid'
	}
}

const useStyles = makeStyles(() => ({
	companySpi: {
		borderLeft: '2px solid black !important' as any,
	},
}))

export function VPD() {
	const classes = useStyles()
	function disableSort(header: Header) {
		return header.id === 'avatar'
	}

	const headers: Header[] = [
		{
			id: 'avatar',
			title: '',
			accessor: 'avatar',
			readOnly: true,
			disableBackspace: true,
			disableCellCut: true,
			disableCellPaste: true,
			width: '3%',
			cellRenderer: ({ row }: { row: any }) => {
				const index = rows.findIndex(e => e.id === row.id)
				const isOdd = index % 2 === 0
				return (
					<div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
						<Avatar style={{ backgroundColor: isOdd ? 'orange' : '' }}>
							{(row['name'] as string).slice(0, 1).toUpperCase()}
						</Avatar>
					</div>
				)
			},
		},
		{
			id: 'name',
			title: 'Name',
			accessor: 'name',
			width: '14%',
		},
		{
			id: 'progress',
			title: 'Progress',
			accessor: 'progress',
			width: '40%',
			cellRenderer: ({ row }: { row: any }) => {
				const index = rows.findIndex(e => e.id === row.id)
				const isOdd = index % 2 === 0
				return (
					<div style={{ width: '100%' }}>
						<LinearProgress color={isOdd ? 'primary' : 'secondary'} />
					</div>
				)
			},
		},
		{
			id: 'spi',
			title: 'SPI',
			accessor: 'spi',
			width: '5%',
		},
		{
			id: 'cpi',
			title: 'CPI',
			accessor: 'cpi',
			width: '5%',
		},
		{
			id: 'time',
			title: 'Tasks Time',
			accessor: 'time',
			width: '5%',
		},
		{
			id: 'status',
			title: 'Status',
			accessor: 'status',
			width: '10%',
			cellRenderer: ({ row }: { row: any }) => {
				const color = getStatusColor(row['status'])
				const text = getStatusText(row['status'])
				return <span style={{ color }}>{text}</span>
			},
		},
		{
			id: 'companySpi',
			title: 'SPI',
			accessor: 'spi',
			width: '5%',
			className: classes.companySpi,
			cellClassName: classes.companySpi,
		},
		{
			id: 'companyCpi',
			title: 'CPI',
			accessor: 'cpi',
			width: '5%',
		},
	]

	return (
		<Box width={'98%'} height={'400px'} style={{ margin: 10 }}>
			<ApolloSpreadSheet
				headers={headers}
				rows={rows}
				minColumnWidth={30}
				disableSort={disableSort}
				overscanRowCount={20}
				nestedHeaders={[
					[
						{
							title: 'Project',
							colSpan: 7,
						},
						{
							title: 'Company',
							colSpan: 2,
							className: classes.companySpi,
						},
					],
				]}
			/>
		</Box>
	)
}
