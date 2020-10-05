import { shallow } from 'enzyme'
import ColumnGrid from '../ColumnGrid'
import { ColumnGridProps } from '../column-grid-props'
import React from 'react'
import { createColumnMock } from '../__mocks__/column-mock'

describe('<ColumnGrid />', () => {
	const props: ColumnGridProps = {
		headers: [[
			createColumnMock({ id: '1', width: 100, title: 'First' }),
			createColumnMock({ id: '12', title: 'Second', tooltip: 'Test' }),
		]],
		minRowHeight: 10,
		defaultColumnWidth: 10,
		getColumnWidth: ({ index }: { index: number }) => 0,
		width: 100,
		scrollLeft: 0,
		isScrolling: false,
		height: 100,
		coords: { rowIndex: 0, colIndex: 0 },
	}
	const grid = shallow(<ColumnGrid {...props} />)

	it('should match the snapshot', () => {
		expect(grid.html()).toMatchSnapshot()
	})

})