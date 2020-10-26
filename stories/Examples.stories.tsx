import React from 'react'
import { storiesOf } from '@storybook/react'
import { Table } from './components/Table/Table'
import { Spreadsheet } from "./components/Spreadsheet/Spreadsheet"
import { VPD } from './components/VPD'

storiesOf('Examples', module)
	.add('Spreadsheet', () => <Spreadsheet />)
	.add('Table', () => <Table />)
	.add('VPD', () => <VPD />)
