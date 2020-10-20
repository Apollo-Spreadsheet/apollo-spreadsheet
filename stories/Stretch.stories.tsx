import { getSimpleData } from './components/LargeDataGrid/generateData'
import { ApolloSpreadSheet } from '../src'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { StretchMode } from '../src/types/stretch-mode.enum'
import { Header } from '../src/columnGrid/types/header.type'
import { createColumnMock } from '../src/columnGrid/__mocks__/column-mock'

const ExampleTable = ({ headerData, data, stretchMode }) => {
	return (
		<ApolloSpreadSheet
			headers={headerData}
			rows={data}
			minColumnWidth={120}
			stretchMode={stretchMode}
		/>
	)
}

storiesOf('Stretch Modes', module)
	.add('None (with remaining width left and no scroll)', () => {
		const { data } = getSimpleData(10, 3)
		const headers: Header[] = [
			createColumnMock({ width: '20%', title: 'First' }),
			createColumnMock({ width: '20%', title: 'Second' }),
			createColumnMock({ width: '50%', title: 'Third' }),
		]
		return <ExampleTable headerData={[headers]} data={data} stretchMode={StretchMode.None} />
	})
	.add('None (fixed widths with scroll)', () => {
		const headers: Header[] = [
			createColumnMock({ width: 140, title: 'First' }),
			createColumnMock({ width: 140, title: 'Second' }),
		]
		const { data } = getSimpleData(5, 2)
		return <ExampleTable headerData={[headers]} data={data} stretchMode={StretchMode.None} />
	})
	.add('None (default with scroll)', () => {
		const { headerData, data } = getSimpleData(10, 50)
		return <ExampleTable headerData={headerData} data={data} stretchMode={StretchMode.None} />
	})
	.add('All', () => {
		const headers: Header[] = [
			createColumnMock({ width: '20%', title: 'First' }),
			createColumnMock({ width: '30%', title: 'Second' }),
			createColumnMock({ width: '10%', title: 'Remain' }),
		]
		const { data } = getSimpleData(4, 3)
		return <ExampleTable headerData={[headers]} data={data} stretchMode={StretchMode.All} />
	})
	.add('Last', () => {
		const { data } = getSimpleData(10, 3)
		const headers: Header[] = [
			createColumnMock({ width: '20%', title: 'First' }),
			createColumnMock({ width: '30%', title: 'Second' }),
			createColumnMock({ width: 200, title: 'Adjusted one' }),
		]
		return <ExampleTable headerData={[headers]} data={data} stretchMode={StretchMode.Last} />
	})
