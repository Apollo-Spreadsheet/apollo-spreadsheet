import React from 'react'
import { storiesOf } from '@storybook/react'
import { Table } from './components/Table/Table'
import { Spreadsheet } from "./components/Spreadsheet/Spreadsheet"
import LargeDataGrid from "./components/LargeDataGrid/LargeDataGrid"

storiesOf('Examples', module)
	.add('Spreadsheet', () => <Spreadsheet />)
	.add('Table', () => <Table />)
	// .add('Grid (Large data set)', () => <LargeDataGrid />)
