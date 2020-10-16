import React from 'react'
import { storiesOf } from '@storybook/react'
import { Table } from './components/Table/Table'
import { Spreadsheet } from "./components/Spreadsheet/Spreadsheet"
import LargeDataGrid from "./components/LargeDataGrid/LargeDataGrid"
import { VPD } from './components/VPD'

storiesOf('Examples', module)
	.add('Spreadsheet', () => <Spreadsheet />)
	.add('Table', () => <Table />)
	.add('VPD', () => <VPD />)
	// .add('Grid (Large data set)', () => <LargeDataGrid />)
