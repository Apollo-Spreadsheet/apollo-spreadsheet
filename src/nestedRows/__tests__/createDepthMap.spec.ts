import { createDepthMap } from '../createDepthMap'
import { Row } from '../../types'
import { DepthMap } from '../depth-map.interface'

describe('createDepthMap', () => {
	it('should return empty', () => {
		expect(createDepthMap([], 'id')).toEqual({})
	})

	it('should return empty if selectionKey does not find the row', () => {
		const rows: Row[] = [{
			id: '1234',
		}]
		expect(createDepthMap(rows, 'nonexistingid')).toEqual({})
	})

	it('should return only one row if it contains a valid selectionKey field', () => {
		const rows: Row[] = [{
			id: '1234',
		}, {
			_id: '555'
		}]
		expect(createDepthMap(rows, '_id')).toEqual({ "555": 1 })
	})

	it('should create correctly the depths', () => {
		const rows: Row[] = [{
			id: '1',
			__children: [{
				id: '11',
				__children: [{
					id: '111'
				}]
			}]
		}, {
			id: '2',
			__children: [{
				id: '22'
			}]
		}]
		const expected: DepthMap = {
			1: 1,
			11: 2,
			111: 3,
			2: 1,
			22: 2
		}
		expect(createDepthMap(rows, 'id')).toEqual(expected)
	})

	it('should use a default depth if passed', () => {
		const rows: Row[] = [{
			id: 1
		}]
		expect(createDepthMap(rows, 'id', 5)).toEqual({ 1: 5 })
	})

	it('should use a default depth map if provided', () => {
		const rows: Row[] = [{
			id: 1
		}]
		const expected: DepthMap = {
			22: 50,
			1: 1
		}
		expect(createDepthMap(rows, 'id', 1, { 22: 50 })).toEqual(expected)
	})
})