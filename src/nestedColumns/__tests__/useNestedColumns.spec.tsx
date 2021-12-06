import React, { useRef } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import {  useApiFactory, useApiRef } from '../../api'
import { useNestedColumns } from "../useNestedColumns";
import api from "simple-git/src/lib/api";
import { Column } from '../../columnGrid';

describe('useNestedColumns hook', () => {
  it('should define NestedColumnsApi', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedColumns({ apiRef, initialised: true, enabled: true, defaultExpandedColumnsIds: [] }))
    expect(apiRef.current.isInitialised).toEqual(true)
    expect(apiRef.current.toggleColumnExpand).toBeDefined()
    expect(apiRef.current.isColumnExpanded).toBeDefined()
    expect(apiRef.current.getExpandedColumns).toBeDefined()
    expect(apiRef.current.getColumnDepth).toBeDefined()
  })

  it('should try to get non existing Column depth and state', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedColumns({ apiRef, initialised: true, enabled: true, defaultExpandedColumnsIds: [] }))
    expect(apiRef.current.isColumnExpanded('nothing')).toEqual(false)
    expect(apiRef.current.getColumnDepth('nothing')).toEqual(1)
  })

  it('should set defaultExpandedIds if provided', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedColumns({ apiRef, initialised: true, enabled: true, defaultExpandedColumnsIds: ['test-id'] }))
    expect(apiRef.current.isColumnExpanded('test-id')).toEqual(true)
    expect(apiRef.current.getColumnDepth('test-id')).toEqual(1)
    expect(apiRef.current.getExpandedColumns()).toEqual(['test-id'])
  })

  it('should only use unique defaultExpandedIds and remove duplicated', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedColumns({ apiRef, initialised: true, enabled: true, defaultExpandedColumnsIds: ['duplicated-id', 'duplicated-id'] }))
    expect(apiRef.current.isColumnExpanded('duplicated-id')).toEqual(true)
    expect(apiRef.current.getColumnDepth('duplicated-id')).toEqual(1)
    expect(apiRef.current.getExpandedColumns()).toEqual(['duplicated-id'])
  })

  it('should getColumnDepth correctly', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    const originalColumns: Column[] = [{
      id: '1',
      title: 'A',
      accessor: "1",
      __children: [{
        id: '11',
        title: 'AA',
        accessor: "11",
        __children: [{
          id: '111',
          title: 'AAAA',
          accessor: "111",
          __children: [{
            id: '1111',
            title: 'AAAAA',
            accessor: "1111",
          }]
        }]
      }]
    }, {
      id: '2',
      title: 'B',
      accessor: "2",
      __children: [{
        id: '22',
        title: 'BB',
        accessor: "22",
      }]
    }]

    apiRef.current.getOriginalColumns = jest.fn().mockReturnValue(originalColumns)

    renderHook(() => useNestedColumns({ apiRef, initialised: true, enabled: true, defaultExpandedColumnsIds: [] }))
    act(() => {
      //We can provide the original Columns by default
      apiRef.current.dispatchEvent('COLUMNS_CHANGED', originalColumns)
    })
    expect(apiRef.current.getColumnDepth('1')).toEqual(1)
    expect(apiRef.current.getColumnDepth('11')).toEqual(2)
    expect(apiRef.current.getColumnDepth('111')).toEqual(3)
    expect(apiRef.current.getColumnDepth('1111')).toEqual(4)
    expect(apiRef.current.getColumnDepth('2')).toEqual(1)
    expect(apiRef.current.getColumnDepth('22')).toEqual(2)

  })

  it('should toggleColumnExpand with defaultExpandedIds successfully', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedColumns({ apiRef, initialised: true, enabled: true, defaultExpandedColumnsIds: ['1'] }))
    act(() => {
      //This Column has been provided by default so it should toggle
      apiRef.current.toggleColumnExpand('1')
    })

    expect(apiRef.current.isColumnExpanded('1')).toEqual(false)
  })

  it('should toggleColumnExpand successfully', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedColumns({ apiRef, initialised: true, enabled: true, defaultExpandedColumnsIds: [] }))
    act(() => {
      apiRef.current.toggleColumnExpand('1')
      expect(apiRef.current.isColumnExpanded('1')).toEqual(true)
    })

    act(() => {
      apiRef.current.toggleColumnExpand('1')
    })

    expect(apiRef.current.isColumnExpanded('1')).toEqual(false)
  })
})