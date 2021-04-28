import { shallow } from 'enzyme'
import ColumnGrid from '../ColumnGrid'
import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useApiRef } from '../../api'
import { ColumnGridProps } from "../columnGridProps";
import { createColumnFixture } from "../fixtures/column.fixture";

describe('<ColumnGrid />', () => {
	const { result: { current: apiRefMock }} = renderHook(() => useApiRef())
	const props: ColumnGridProps = {
		sort: null,
		columns: [
			createColumnFixture({ id: '1', width: 100, title: 'First' }),
			createColumnFixture({ id: '12', title: 'Second', tooltip: 'Test' }),
		],
		data: [],
		minRowHeight: 10,
		minColumnWidth: 10,
		getColumnWidth: ({ index }: { index: number }) => 0,
		width: 100,
		scrollLeft: 0,
		coords: { rowIndex: 0, colIndex: 0 },
		apiRef: apiRefMock,
		nestedRowsEnabled: false
	}
	const grid = shallow(<ColumnGrid {...props} />)

	it('should match the snapshot', () => {
		expect(grid.html()).toMatchSnapshot()
	})

})