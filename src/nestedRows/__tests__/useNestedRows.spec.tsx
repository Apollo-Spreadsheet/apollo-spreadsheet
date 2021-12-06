import React, { useRef } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import {  useApiFactory, useApiRef } from '../../api'
import { useNestedRows } from "../useNestedRows";
import { Row } from "../../types";
import api from "simple-git/src/lib/api";

describe('useNestedRows hook', () => {
  it('should define NestedRowsApi', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedRows({ apiRef, initialised: true, enabled: true, defaultExpandedIds: [] }))
    expect(apiRef.current.isInitialised).toEqual(true)
    expect(apiRef.current.toggleRowExpand).toBeDefined()
    expect(apiRef.current.isRowExpanded).toBeDefined()
    expect(apiRef.current.getExpandedRows).toBeDefined()
    expect(apiRef.current.getRowDepth).toBeDefined()
  })

  it('should try to get non existing row depth and state', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedRows({ apiRef, initialised: true, enabled: true, defaultExpandedIds: [] }))
    expect(apiRef.current.isRowExpanded('nothing')).toEqual(false)
    expect(apiRef.current.getRowDepth('nothing')).toEqual(1)
  })

  it('should set defaultExpandedIds if provided', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedRows({ apiRef, initialised: true, enabled: true, defaultExpandedIds: ['test-id'] }))
    expect(apiRef.current.isRowExpanded('test-id')).toEqual(true)
    expect(apiRef.current.getRowDepth('test-id')).toEqual(1)
    expect(apiRef.current.getExpandedRows()).toEqual(['test-id'])
  })

  it('should only use unique defaultExpandedIds and remove duplicated', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedRows({ apiRef, initialised: true, enabled: true, defaultExpandedIds: ['duplicated-id', 'duplicated-id'] }))
    expect(apiRef.current.isRowExpanded('duplicated-id')).toEqual(true)
    expect(apiRef.current.getRowDepth('duplicated-id')).toEqual(1)
    expect(apiRef.current.getExpandedRows()).toEqual(['duplicated-id'])
  })

  it('should getRowDepth correctly', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    const originalRows: Row[] = [{
      id: '1',
      name: 'A',
      __children: [{
        id: '11',
        name: 'AA',
        __children: [{
          id: '111',
          name: 'AAAA',
          __children: [{
            id: '1111',
            name: 'AAAAA'
          }]
        }]
      }]
    }, {
      id: '2',
      name: 'B'
    }]

    apiRef.current.getOriginalRows = jest.fn().mockReturnValue(originalRows)

    renderHook(() => useNestedRows({ apiRef, initialised: true, enabled: true, defaultExpandedIds: [] }))
    act(() => {
      //We can provide the original rows by default
      apiRef.current.dispatchEvent('ROWS_CHANGED', originalRows)
    })
    expect(apiRef.current.getRowDepth('1')).toEqual(1)
    expect(apiRef.current.getRowDepth('11')).toEqual(2)
    expect(apiRef.current.getRowDepth('111')).toEqual(3)
    expect(apiRef.current.getRowDepth('1111')).toEqual(4)
    expect(apiRef.current.getRowDepth('2')).toEqual(1)
  })

  it('should toggleRowExpand with defaultExpandedIds successfully', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedRows({ apiRef, initialised: true, enabled: true, defaultExpandedIds: ['1'] }))
    act(() => {
      //This row has been provided by default so it should toggle
      apiRef.current.toggleRowExpand('1')
    })

    expect(apiRef.current.isRowExpanded('1')).toEqual(false)
  })

  it('should toggleRowExpand successfully', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useNestedRows({ apiRef, initialised: true, enabled: true, defaultExpandedIds: [] }))
    act(() => {
      apiRef.current.toggleRowExpand('1')
      expect(apiRef.current.isRowExpanded('1')).toEqual(true)
    })

    act(() => {
      apiRef.current.toggleRowExpand('1')
    })

    expect(apiRef.current.isRowExpanded('1')).toEqual(false)
  })
})