import faker from 'faker'
import { GridRow } from '../types/row.interface'
import { Header, NestedHeader } from '../src/columnGrid/types/header.type'

export const getSimpleData = (rows: number, columns: number) => {
	const headerData: Header[] = []
	const nestedHeaders: NestedHeader[] = []
	const data: any = []
	const headerRows = 2

	for (let i = 0; i < headerRows; i += 1) {
		const row: Header[] = []
		for (let j = 0; j < columns; j += 1) {
			if (i === 0) {
				if (j % 2 === 0) {
					row.push({
						id: 'col-' + Math.random() + i,
						title: `Colspanned Column [${i + 1}, ${j + 1}]`,
						colSpan: 2,
						accessor: '',
					})
				}
			} else {
				row.push({
					id: 'col-c-' + Math.random() + j,
					title: `Column [${i + 1}, ${j + 1}]`,
					accessor: '',
				})
			}
		}

		headerData.push(row as any)
	}

	for (let i = 0; i < columns; i += 1) {
																					;(headerData[0] as any).push({
																						id: 'col-g-' + Math.random() + i,
																						title: `Column ${i + 1}`,
																						accessor: '',
																					})
																				}

	for (let i = 0; i < rows; i += 1) {
		const row: GridRow = []

		for (let j = 0; j < columns; j += 1) {
			if (j === 0) {
				if (i % 3 === 0) {
					row.push({
						id: 'faked-' + Math.random(),
						children: `Rowspanned Cell [${i + 1}, ${j + 1}]`,
						rowSpan: 3,
					})
				}
			} else {
				row.push({
					id: 'child-' + Math.random(),
					children: faker.lorem.text(1),
				})
			}
		}

		data.push(row)
	}

	return {
		headerData,
		data,
	}
}
