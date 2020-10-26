import { ApolloSpreadSheet, GridWrapperProps } from '../src'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { StretchMode } from '../src/types/stretch-mode.enum'
import { Column } from '../src/columnGrid/types/header.type'
import { createColumnMock } from '../src/columnGrid/__mocks__/column-mock'
import faker from 'faker'
import { Alignment } from 'react-virtualized'

interface ExampleTableProps {
	overrideRows?: any[]
	stretchMode: StretchMode
	headerData: Column[]
	scrollToAlignment?: Alignment
}

const ExampleTable = ({
	headerData,
	stretchMode,
	overrideRows,
	scrollToAlignment,
}: ExampleTableProps) => {
	const rows = new Array(20).fill(true).map(() => ({
		id: faker.random.number(),
		name: faker.name.findName(),
		country: faker.address.country(),
	}))
	return (
		<div
			style={{
				height: '500px',
				width: '100%',
				overflowY: 'hidden',
				flex: 1,
				display: 'flex',
			}}
		>
			<ApolloSpreadSheet
				columns={headerData}
				rows={overrideRows ?? rows}
				minColumnWidth={120}
				stretchMode={stretchMode}
				scrollToAlignment={scrollToAlignment}
			/>
		</div>
	)
}

storiesOf('Scroll Alignment', module)
	.add('Auto (default)', () => {
		const headers: Column[] = [
			createColumnMock({ width: '20%', title: 'Id', accessor: 'id' }),
			createColumnMock({ width: '30%', title: 'Name', accessor: 'name' }),
			createColumnMock({ width: '10%', title: 'Country', accessor: 'country' }),
		]
		return <ExampleTable headerData={headers} stretchMode={StretchMode.All} />
	})
	.add('Center', () => {
		const headers: Column[] = [
			createColumnMock({ width: '20%', title: 'Id', accessor: 'id' }),
			createColumnMock({ width: '30%', title: 'Name', accessor: 'name' }),
			createColumnMock({ width: '10%', title: 'Country', accessor: 'country' }),
		]
		return (
			<ExampleTable
				headerData={headers}
				stretchMode={StretchMode.All}
				scrollToAlignment={'center'}
			/>
		)
	})
	.add('Start', () => {
		const headers: Column[] = [
			createColumnMock({ width: '20%', title: 'Id', accessor: 'id' }),
			createColumnMock({ width: '30%', title: 'Name', accessor: 'name' }),
			createColumnMock({ width: '10%', title: 'Country', accessor: 'country' }),
		]
		return (
			<ExampleTable
				headerData={headers}
				stretchMode={StretchMode.All}
				scrollToAlignment={'start'}
			/>
		)
	})
	.add('End', () => {
		const headers: Column[] = [
			createColumnMock({ width: '20%', title: 'Id', accessor: 'id' }),
			createColumnMock({ width: '30%', title: 'Name', accessor: 'name' }),
			createColumnMock({ width: '10%', title: 'Country', accessor: 'country' }),
		]
		return (
			<ExampleTable
				headerData={headers}
				stretchMode={StretchMode.All}
				scrollToAlignment={'end'}
			/>
		)
	})
