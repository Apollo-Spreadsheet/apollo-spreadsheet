import React, { useRef } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import {  useApiFactory, useApiRef } from '../../api'
import { SortState, useSort } from "../useSort";
import { SortApi } from "../../api/types/sortApi";
import api from "simple-git/src/lib/api";
import { Column } from "../../columnGrid";

describe('useSort hook', () => {
  it('should define SortApi', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })
    const { result: { current: sort } } = renderHook(() => useSort(apiRef))

    expect(apiRef.current.isInitialised).toEqual(true)
    expect(apiRef.current.getSortState).toBeDefined()
    expect(apiRef.current.clearSort).toBeDefined()
    expect(apiRef.current.toggleSort).toBeDefined()
    expect(apiRef.current.sortColumn).toBeDefined()
    expect(sort).toEqual(null)
  })

  it('should sortColumn successfully', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useSort(apiRef))
    apiRef.current.getColumnById = jest.fn().mockImplementation(() => {
      return { id: '1234', accessor: 'test' } as Column
    })
    apiRef.current.getRows = jest.fn().mockReturnValue([])
    apiRef.current.updateRows = jest.fn()

    expect(apiRef.current.isInitialised).toEqual(true)
    expect(apiRef.current.getSortState).toBeDefined()
    expect(apiRef.current.clearSort).toBeDefined()
    expect(apiRef.current.toggleSort).toBeDefined()
    expect(apiRef.current.sortColumn).toBeDefined()
    act(() => {
      apiRef.current.sortColumn('test', 'asc')
    })

    expect(apiRef.current.getSortState()).toEqual({ accessor: 'test', order: 'asc' } as SortState)
    expect(apiRef.current.getColumnById).toHaveBeenCalled()
    expect(apiRef.current.getRows).toHaveBeenCalled()
    expect(apiRef.current.updateRows).toHaveBeenCalled()
  })

  it('should toggle sort successfully', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useSort(apiRef))
    apiRef.current.getColumnById = jest.fn().mockImplementation(() => {
      return { id: '1234', accessor: 'test' } as Column
    })
    apiRef.current.getRows = jest.fn().mockReturnValue([])
    apiRef.current.updateRows = jest.fn()
    apiRef.current.getOriginalRows = jest.fn().mockReturnValue([])

    expect(apiRef.current.isInitialised).toEqual(true)

    //Toggle -> asc from null
    act(() => {
      apiRef.current.toggleSort('test')
      expect(apiRef.current.getSortState()).toEqual({accessor: 'test', order: 'asc' } as SortState)
    })

    //Toggle -> desc
    act(() => {
      apiRef.current.toggleSort('test')
      expect(apiRef.current.getSortState()).toEqual({accessor: 'test', order: 'desc' } as SortState)
    })

    //Last toggle clears
    act(() => {
      apiRef.current.toggleSort('test')
    })

    expect(apiRef.current.getSortState()).toEqual(null)
  })

  it('should clear sort successfully', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })

    renderHook(() => useSort(apiRef))
    apiRef.current.getColumnById = jest.fn().mockImplementation(() => {
      return { id: '1234', accessor: 'test' } as Column
    })
    apiRef.current.getRows = jest.fn().mockReturnValue([])
    apiRef.current.updateRows = jest.fn()
    apiRef.current.getOriginalRows = jest.fn().mockReturnValue([])

    expect(apiRef.current.isInitialised).toEqual(true)

    //Trigger sort
    act(() => {
      apiRef.current.sortColumn('test', 'asc')
    })

    //Trigger clear
    act(() => {
      apiRef.current.clearSort()
    })

    expect(apiRef.current.getSortState()).toEqual(null)
    expect(apiRef.current.updateRows).toHaveBeenCalledTimes(2)
  })
})