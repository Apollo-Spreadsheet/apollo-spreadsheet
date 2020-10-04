import { getSimpleData } from './generateData'
import { ApolloSpreadSheet } from '../index'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { StretchMode } from '../types/stretch-mode.enum'
import { Column } from '../column-grid/types/header.type'
import { createColumnMock } from '../column-grid/__mocks__/column-mock'

const ExampleTable = ({ headerData, data, stretchMode }) => {
	return (
		<ApolloSpreadSheet
			headers={headerData}
			data={data}
			fixedColumnCount={2}
			onCellChange={console.log}
			minColumnWidth={120}
			stretchMode={stretchMode}
		/>
	)
}

storiesOf('Stretch Modes', module)
	.add('None (with remaining width left and no scroll)', () => {
		const { headerData, data } = getSimpleData(10, 3)
		return <ExampleTable headerData={headerData} data={data} stretchMode={StretchMode.None} />
	})
	.add('None (fixed widths with scroll)', () => {
		const headers: Column[] = [
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
		const headers: Column[] = [
			createColumnMock({ width: '20%', title: 'First' }),
			createColumnMock({ width: '30%', title: 'Second' }),
			createColumnMock({ width: '10%', title: 'Remain' }),
		]
		const { data } = getSimpleData(4, 3)
		return <ExampleTable headerData={[headers]} data={data} stretchMode={StretchMode.All} />
	})
	.add('Last', () => {
		const { data } = getSimpleData(10, 3)
		const headers: Column[] = [
			createColumnMock({ width: '20%', title: 'First' }),
			createColumnMock({ width: '30%', title: 'Second' }),
			createColumnMock({ width: 200, title: 'Adjusted one' }),
		]
		return <ExampleTable headerData={[headers]} data={data} stretchMode={StretchMode.Last} />
	})
