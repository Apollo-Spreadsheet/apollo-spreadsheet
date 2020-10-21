import { ApolloSpreadSheet } from '../src'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { StretchMode } from '../src/types/stretch-mode.enum'
import { Header } from '../src/columnGrid/types/header.type'
import { createColumnMock } from '../src/columnGrid/__mocks__/column-mock'
import faker from 'faker'

const ExampleTable = ({ headerData, stretchMode }) => {
	const rows = new Array(20).fill(true).map(() => ({
		id: faker.random.number(),
		name: faker.name.findName(),
		country: faker.address.country(),
	}))
	console.log(rows)
	return (
		<div style={{ height: '500px', width: '100%', overflowY: 'hidden', flex: 1, display: 'flex'}}>
			<ApolloSpreadSheet
				headers={headerData}
				rows={rows}
				minColumnWidth={120}
				stretchMode={stretchMode}
			/>
		</div>
	)
}

storiesOf('Stretch Modes', module)
	.add('None (with remaining width left and no scroll)', () => {
		const headers: Header[] = [
			createColumnMock({ width: '20%', title: 'Id', accessor: 'id' }),
			createColumnMock({ width: '20%', title: 'Name', accessor: 'name' }),
			createColumnMock({ width: '50%', title: 'Country', accessor: 'country' }),
		]
		return <ExampleTable headerData={headers} stretchMode={StretchMode.None} />
	})
	.add('None (fixed widths with scroll)', () => {
		const headers: Header[] = [
			createColumnMock({ width: 140, title: 'Id', accessor: 'id' }),
			createColumnMock({ width: 140, title: 'Name', accessor: 'name' })
		]
		return <ExampleTable headerData={headers} stretchMode={StretchMode.None} />
	})
	.add('None (default with scroll)', () => {
		const headers: Header[] = [
			createColumnMock({ width: 140, title: 'Id', accessor: 'id' }),
			createColumnMock({ width: 140, title: 'Name', accessor: 'name' })
		]
		return <ExampleTable headerData={headers} stretchMode={StretchMode.None} />
	})
	.add('All', () => {
		const headers: Header[] = [
			createColumnMock({ width: '20%', title: 'Id', accessor: 'id' }),
			createColumnMock({ width: '30%', title: 'Name', accessor: 'name' }),
			createColumnMock({ width: '10%', title: 'Country', accessor: 'country' }),
		]
		return <ExampleTable headerData={headers}  stretchMode={StretchMode.All} />
	})
	.add('Last', () => {
		const headers: Header[] = [
			createColumnMock({ width: '20%', title: 'Id', accessor: 'id' }),
			createColumnMock({ width: '30%', title: 'Name', accessor: 'name' }),
			createColumnMock({ title: 'Country', accessor: 'country' }),
		]
		return <ExampleTable headerData={headers}  stretchMode={StretchMode.Last} />
	})
