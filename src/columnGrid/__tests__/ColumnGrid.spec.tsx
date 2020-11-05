import { shallow } from 'enzyme'
import ColumnGrid from '../ColumnGrid'
import { ColumnGridProps } from '../column-grid-props'
import React from 'react'
import { createColumnMock } from '../__mocks__/column-mock'
import { renderHook } from '@testing-library/react-hooks'
import { useApiRef } from '../../api'

describe('<ColumnGrid />', () => {
	const { result: { current: apiRefMock }} = renderHook(() => useApiRef())
	const props: ColumnGridProps = {
		sort: null,
		columns: [
			createColumnMock({ id: '1', width: 100, title: 'First' }),
			createColumnMock({ id: '12', title: 'Second', tooltip: 'Test' }),
		],
		data: [],
		minRowHeight: 10,
		defaultColumnWidth: 10,
		getColumnWidth: ({ index }: { index: number }) => 0,
		width: 100,
		scrollLeft: 0,
		coords: { rowIndex: 0, colIndex: 0 },
		apiRef: apiRefMock
	}
	const grid = shallow(<ColumnGrid {...props} />)

	it('should match the snapshot', () => {
		expect(grid.html()).toMatchSnapshot()
	})

})