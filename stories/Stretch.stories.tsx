import { ApolloSpreadSheet } from '../src'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { StretchMode } from '../src/types/stretch-mode.enum'
import { Column } from '../src/columnGrid/types/header.type'
import { createColumnMock } from '../src/columnGrid/__mocks__/column-mock'
import faker from 'faker'

interface ExampleTableProps {
	overrideRows?: any[]
	stretchMode: StretchMode
	headerData: Column[]
}
const ExampleTable = ({ headerData, stretchMode, overrideRows }: ExampleTableProps) => {
	const rows = new Array(20).fill(true).map(() => ({
		id: faker.random.number(),
		name: faker.name.findName(),
		country: faker.address.country(),
	}))
	return (
		<div style={{ height: '500px', width: '100%', overflowY: 'hidden', flex: 1, display: 'flex' }}>
			<ApolloSpreadSheet
				columns={headerData}
				rows={overrideRows ?? rows}
				minColumnWidth={120}
				stretchMode={stretchMode}
			/>
		</div>
	)
}

storiesOf('Stretch Modes', module)
	.add('None (fixed widths)', () => {
		const headers: Column[] = [
			createColumnMock({ width: 140, title: 'Id', accessor: 'id' }),
			createColumnMock({ width: 140, title: 'Name', accessor: 'name' }),
		]
		return <ExampleTable headerData={headers} stretchMode={StretchMode.None} />
	})
	.add('None (default with horizontal scroll) 100x100', () => {
		const headers: Column[] = new Array(100)
			.fill(true)
			.map((_, i) => createColumnMock({ width: 120, title: 'Col - ' + i, accessor: i.toString() }))
		const overrideRows = new Array(100).fill(true).map((_, i) => {
			const row: any = {}
			headers.forEach((header, headerIndex) => {
				row[headerIndex] = faker.name.firstName()
			})
			return row
		})
		return (
			<ExampleTable
				headerData={headers}
				overrideRows={overrideRows}
				stretchMode={StretchMode.None}
			/>
		)
	})
	.add('All', () => {
		const headers: Column[] = [
			createColumnMock({ width: '20%', title: 'Id', accessor: 'id' }),
			createColumnMock({ width: '30%', title: 'Name', accessor: 'name' }),
			createColumnMock({ width: '10%', title: 'Country', accessor: 'country' }),
		]
		return <ExampleTable headerData={headers} stretchMode={StretchMode.All} />
	})
	.add('Last', () => {
		const headers: Column[] = [
			createColumnMock({ width: '20%', title: 'Id', accessor: 'id' }),
			createColumnMock({ width: '30%', title: 'Name', accessor: 'name' }),
			createColumnMock({ title: 'Country', accessor: 'country' }),
		]
		return <ExampleTable headerData={headers} stretchMode={StretchMode.Last} />
	})
