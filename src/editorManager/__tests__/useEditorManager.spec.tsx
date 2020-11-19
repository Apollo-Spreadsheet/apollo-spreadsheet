import { renderHook, act } from '@testing-library/react-hooks'
import { useEditorManager } from '../useEditorManager'
import { createColumnMock } from '../../columnGrid/__mocks__/column-mock'
import { ROW_SELECTION_HEADER_ID, useRowSelection } from '../../rowSelection/useRowSelection'
import TextEditor from '../components/TextEditor'
import { EditorProps } from '../editorProps'
import React, { useRef } from 'react'
import { isElementOfType } from 'react-dom/test-utils'
import { NavigationCoords } from '../../navigation/types/navigation-coords.type'
import { ICellEditor } from '../../columnGrid/types/header.type'
import { useApiFactory, useApiRef } from '../../api'
import { useData } from '../../data'
import { useHeaders } from '../../columnGrid'
import { useMergeCells } from '../../mergeCells'

describe('useEditorManager hook', () => {
	const { result: { current: apiRefMock }} = renderHook(() => {
		const ref = useApiRef()
		const divRef = useRef(document.createElement('div'))
		const mockedColumns = [
			createColumnMock({
				id: 'test',
				accessor: 'name',
			})
		]
		useApiFactory(divRef, ref)
		useHeaders({ columns: mockedColumns, apiRef: ref, initialised: true, minColumnWidth: 30 })
		useMergeCells({ mergeCells: [], apiRef: ref, initialised: true, rowCount: 2, columnCount: 1})
		useData({
			apiRef: ref,
			initialised: ref.current.isInitialised,
			rows: [{
				id: '1234',
				name: 'testValue',
			}, {
				id: '222',
				name: 'test',
			}],
		})
		return ref
	})

	it('should mount', () => {
		const { result } = renderHook(() => useEditorManager({ apiRef: apiRefMock, initialised: apiRefMock.current.isInitialised, onCellChange: jest.fn() }))
		expect(result.current).toEqual(null)
		expect(apiRefMock.current.getEditorState()).toEqual(null)
	})

	it('should block startEditing at __selection__ column type', () => {
		const { result: { current: apiLocalMock }} = renderHook(() => {
			const ref = useApiRef()
			const divRef = useRef(document.createElement('div'))
			useApiFactory(divRef, ref)
			const mockedColumns = [
				createColumnMock({
					id: 'test',
					accessor: 'name',
				})
			]
			useHeaders({ columns: mockedColumns, apiRef: ref, initialised: true, minColumnWidth: 30 })
			useMergeCells({ mergeCells: [], apiRef: ref, initialised: true, rowCount: 1, columnCount: 1})
			useData({
				apiRef: ref,
				initialised: ref.current.isInitialised,
				rows: [{
					id: '1',
					name: 'test',
				}],
			})
			useRowSelection(ref, true, { key: 'id'})
			return ref
		})
		const { result } = renderHook(() => useEditorManager({ apiRef: apiLocalMock, initialised: apiLocalMock.current.isInitialised, onCellChange: jest.fn() }))
		expect(result.current).toEqual(null)
		expect(apiLocalMock.current.getEditorState()).toEqual(null)
		const mockElement = document.createElement('div')
		act(() => {
			apiLocalMock.current.beginEditing({
				coords: { rowIndex: 0, colIndex: 1 },
				targetElement: mockElement,
			})
		})
		expect(apiLocalMock.current.getEditorState()).toEqual(null)
	})

	// it('should throw warning startEditing when column is not found', () => {
	// 	const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
	// 	})
	// 	const { result } = renderHook(() => useEditorManager({
	// 		rows: mockedRows,
	// 		getColumnAt: () => undefined,
	// 		onCellChange: jest.fn(),
	// 	}))
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	const mockElement = document.createElement('div')
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	expect(consoleSpy.mock.calls.length).toBe(1)
	// })
	//
	// it('should not startEditing at readOnly column', () => {
	// 	const mockedReadonlyCb = jest.fn((coords: NavigationCoords) => {
	// 		return coords.rowIndex === 0 && coords.colIndex === 1
	// 	})
	// 	const mockedGetColumnAt = jest.fn((index: number) => {
	// 		return columns[index]
	// 	})
	// 	const rows = [
	// 		{ id: '1' },
	// 		{ id: '2' },
	// 	]
	// 	const columns = [
	// 		createColumnMock({ readOnly: true }),
	// 		createColumnMock({ readOnly: mockedReadonlyCb }),
	// 	]
	// 	const { result } = renderHook(() => useEditorManager({
	// 		rows,
	// 		getColumnAt: mockedGetColumnAt,
	// 		onCellChange: jest.fn(),
	// 	}))
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	const mockElement = document.createElement('div')
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 1 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	expect(mockedReadonlyCb.mock.calls.length).toBe(1)
	// 	expect(mockedGetColumnAt.mock.calls.length).toBe(2)
	// })
	//
	// it('should stopEditing while its not in edit mode', () => {
	// 	const { result } = renderHook(() => useEditorManager({ rows: [], getColumnAt: jest.fn(), onCellChange: jest.fn() }))
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	//
	// 	act(() => {
	// 		result.current.stopEditing()
	// 	})
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// })
	//
	// it('should startEditing (use default editor)', () => {
	// 	const mockElement = document.createElement('div')
	// 	mockElement.style.height = '50'
	// 	mockElement.style.width = '100'
	// 	const { result } = renderHook(() => useEditorManager({
	// 		rows: mockedRows,
	// 		getColumnAt: mockedGetColumnAt,
	// 		onCellChange: jest.fn(),
	// 	}))
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	const partialMockedProps: Partial<EditorProps> = {
	// 		anchorRef: mockElement,
	// 		maxLength: 500,
	// 		cellHeight: mockElement.style.height,
	// 		cellWidth: mockElement.style.width,
	// 	}
	//
	// 	const partialReturnedEditorProps: Partial<EditorProps> = {
	// 		cellHeight: result.current.editorState.editor!.node.props.cellHeight,
	// 		cellWidth: result.current.editorState.editor!.node.props.cellWidth,
	// 		maxLength: result.current.editorState.editor!.node.props.maxLength,
	// 		anchorRef: result.current.editorState.editor!.node.props.anchorRef,
	// 	}
	// 	expect(result.current.editorState.isEditing).toBe(true)
	// 	expect(result.current.editorState.editor?.initialValue).toBe('testValue')
	// 	expect(result.current.editorState.editor?.rowIndex).toBe(0)
	// 	expect(result.current.editorState.editor?.colIndex).toBe(0)
	// 	expect(result.current.editorState.editor?.node).toBeDefined()
	// 	expect(isElementOfType(result.current.editorState.editor!.node, TextEditor)).toBe(true)
	// 	expect(partialReturnedEditorProps).toEqual(partialMockedProps)
	// })
	//
	//
	// it('should startEditing and stopEditing', () => {
	// 	const mockElement = document.createElement('div')
	// 	mockElement.style.height = '50'
	// 	mockElement.style.width = '100'
	// 	const { result } = renderHook(() => useEditorManager({
	// 		rows: mockedRows,
	// 		getColumnAt: mockedGetColumnAt,
	// 		onCellChange: jest.fn(),
	// 	}))
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(true)
	// 	expect(isElementOfType(result.current.editorState.editor!.node, TextEditor)).toBe(true)
	// 	act(() => {
	// 		result.current.stopEditing()
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(false)
	// })
	//
	// it('should invoke onCellChange when value changed', () => {
	// 	const mockElement = document.createElement('div')
	// 	mockElement.style.height = '50'
	// 	mockElement.style.width = '100'
	// 	const mockedCellChange = jest.fn(() => {
	// 	})
	// 	const { result } = renderHook(() => useEditorManager({
	// 			rows: mockedRows,
	// 			getColumnAt: mockedGetColumnAt,
	// 			onCellChange: mockedCellChange,
	// 		}),
	// 	)
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(true)
	// 	expect(isElementOfType(result.current.editorState.editor!.node, TextEditor)).toBe(true)
	// 	act(() => {
	// 		result.current.editorState.editor!.node.props['onCommit']('__new__')
	// 	})
	// 	expect(mockedCellChange).toHaveBeenCalledTimes(1)
	// })
	//
	// it('should cancel the commit', () => {
	// 	const mockElement = document.createElement('div')
	// 	mockElement.style.height = '50'
	// 	mockElement.style.width = '100'
	// 	const mockedCellChange = jest.fn(() => {
	// 	})
	// 	const { result } = renderHook(() => useEditorManager({
	// 			rows: mockedRows,
	// 			getColumnAt: mockedGetColumnAt,
	// 			onCellChange: mockedCellChange,
	// 		}),
	// 	)
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(true)
	// 	expect(isElementOfType(result.current.editorState.editor!.node, TextEditor)).toBe(true)
	// 	act(() => {
	// 		result.current.editorState.editor!.node.props['onCommitCancel']()
	// 	})
	// 	expect(mockedCellChange).toHaveBeenCalledTimes(0)
	// 	expect(result.current.editorState.isEditing).toBe(false)
	// })
	//
	// it('should close the editor if the editing value changes', () => {
	// 	const mockElement = document.createElement('div')
	// 	mockElement.style.height = '50'
	// 	mockElement.style.width = '100'
	// 	const mockedCellChange = jest.fn(() => {
	// 	})
	// 	const { result, rerender } = renderHook((props) => useEditorManager(props), {
	// 		initialProps: {
	// 			rows: mockedRows,
	// 			getColumnAt: mockedGetColumnAt,
	// 			onCellChange: mockedCellChange,
	// 		},
	// 	})
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(true)
	// 	expect(isElementOfType(result.current.editorState.editor!.node, TextEditor)).toBe(true)
	// 	const updatedRows = [...mockedRows]
	// 	updatedRows[0].name = 'changed'
	// 	rerender({
	// 		getColumnAt: mockedGetColumnAt,
	// 		onCellChange: mockedCellChange,
	// 		rows: updatedRows,
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(false)
	// })
	//
	// it('should close the editor when the row does not exist anymore', () => {
	// 	const mockElement = document.createElement('div')
	// 	mockElement.style.height = '50'
	// 	mockElement.style.width = '100'
	// 	const mockedCellChange = jest.fn(() => {
	// 	})
	// 	const { result, rerender } = renderHook((props) => useEditorManager(props), {
	// 		initialProps: {
	// 			rows: mockedRows,
	// 			getColumnAt: mockedGetColumnAt,
	// 			onCellChange: mockedCellChange,
	// 		},
	// 	})
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(true)
	// 	expect(isElementOfType(result.current.editorState.editor!.node, TextEditor)).toBe(true)
	// 	const updatedRows = mockedRows.filter(e => e.id !== mockedRows[0].id)
	// 	rerender({
	// 		getColumnAt: mockedGetColumnAt,
	// 		onCellChange: mockedCellChange,
	// 		rows: updatedRows,
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(false)
	// })
	//
	// it('should close the editor when the Column/Header does not exist anymore', () => {
	// 	const mockElement = document.createElement('div')
	// 	mockElement.style.height = '50'
	// 	mockElement.style.width = '100'
	// 	const mockedCellChange = jest.fn(() => {
	// 	})
	// 	const { result, rerender } = renderHook((props) => useEditorManager(props), {
	// 		initialProps: {
	// 			rows: mockedRows,
	// 			getColumnAt: mockedGetColumnAt,
	// 			onCellChange: mockedCellChange,
	// 		},
	// 	})
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(true)
	// 	expect(isElementOfType(result.current.editorState.editor!.node, TextEditor)).toBe(true)
	// 	rerender({
	// 		getColumnAt: () => undefined,
	// 		onCellChange: mockedCellChange,
	// 		rows: mockedRows,
	// 	} as any)
	// 	expect(result.current.editorState.isEditing).toBe(false)
	// })
	//
	// it('should startEditing with custom editor', () => {
	// 	const mockElement = document.createElement('div')
	// 	mockElement.style.height = '50'
	// 	mockElement.style.width = '100'
	// 	const mockedCellChange = jest.fn(() => {
	// 	})
	// 	const editorFactoryMock: ICellEditor = jest.fn(() => {
	// 		return <div></div>
	// 	})
	// 	const mockColumn = createColumnMock({ editor: editorFactoryMock, accessor: 'name' })
	// 	const getColumnAtMock = jest.fn(() => {
	// 		return mockColumn
	// 	})
	// 	const { result } = renderHook((props) => useEditorManager(props), {
	// 		initialProps: {
	// 			rows: mockedRows,
	// 			getColumnAt: getColumnAtMock,
	// 			onCellChange: mockedCellChange,
	// 		},
	// 	})
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(true)
	// 	expect(isElementOfType(result.current.editorState.editor!.node, 'div')).toBe(true)
	// 	expect(editorFactoryMock).toHaveBeenCalledTimes(1)
	// })
	//
	// it('should allow editing if the given coords are different (in case we forgot to stop editing)', () => {
	// 	const mockElement = document.createElement('div')
	// 	mockElement.style.height = '50'
	// 	mockElement.style.width = '100'
	// 	const { result } = renderHook(() => useEditorManager({
	// 		rows: mockedRows,
	// 		getColumnAt: mockedGetColumnAt,
	// 		onCellChange: jest.fn(),
	// 	}))
	// 	expect(result.current.editorState).toEqual({ isEditing: false })
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 0, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(true)
	// 	expect(isElementOfType(result.current.editorState.editor!.node, TextEditor)).toBe(true)
	// 	act(() => {
	// 		result.current.startEditing({
	// 			coords: { rowIndex: 1, colIndex: 0 },
	// 			targetElement: mockElement,
	// 		})
	// 	})
	// 	expect(result.current.editorState.isEditing).toBe(true)
	// })
})