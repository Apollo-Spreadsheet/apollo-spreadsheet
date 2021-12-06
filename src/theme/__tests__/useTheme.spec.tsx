import React, { useRef } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import {  useApiFactory, useApiRef } from '../../api'
import { useTheme } from "../useTheme";
import { GridTheme } from "../../types";

describe('useTheme hook', () => {
  it('should define ThemeApi', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })
    const { result: { current: theme }} = renderHook(() => useTheme({ apiRef }))

    expect(apiRef.current.isInitialised).toEqual(true)
    expect(apiRef.current.getTheme).toBeDefined()
    expect(apiRef.current.changeTheme).toBeDefined()
    expect(theme).toBeUndefined()
  })

  it('should define ThemeApi with default theme', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })
    const options: GridTheme = {
      cellClass: 'test',
    }
    const { result: { current: theme }} = renderHook(() => useTheme({ apiRef, options }))

    expect(apiRef.current.isInitialised).toEqual(true)
    expect(apiRef.current.getTheme).toBeDefined()
    expect(apiRef.current.changeTheme).toBeDefined()
    expect(theme).toEqual(apiRef.current.getTheme())
    expect(theme?.cellClass).toEqual('test')
  })

  it('should change the theme', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })
    const options: GridTheme = {
      cellClass: 'test',
    }
    const { result: { current: theme }} = renderHook(() => useTheme({ apiRef, options }))

    expect(apiRef.current.isInitialised).toEqual(true)
    expect(apiRef.current.getTheme).toBeDefined()
    expect(apiRef.current.changeTheme).toBeDefined()
    expect(theme).toEqual(apiRef.current.getTheme())
    expect(theme?.cellClass).toEqual('test')

    act(() => {
      apiRef.current.changeTheme({ cellClass: 'new-test'})
    })
    expect(apiRef.current.getTheme()?.cellClass).toEqual('new-test')
  })

  it('should clear the theme', () => {
    const { result: { current: apiRef } } = renderHook(() => {
      const ref = useApiRef()
      const divRef = useRef(document.createElement('div'))
      useApiFactory(divRef, ref)
      return ref
    })
    const options: GridTheme = {
      cellClass: 'test',
    }
    const { result: { current: theme }} = renderHook(() => useTheme({ apiRef, options }))

    expect(apiRef.current.isInitialised).toEqual(true)
    expect(apiRef.current.getTheme).toBeDefined()
    expect(apiRef.current.changeTheme).toBeDefined()
    expect(theme).toEqual(apiRef.current.getTheme())
    expect(theme?.cellClass).toEqual('test')

    act(() => {
      apiRef.current.changeTheme(undefined)
    })
    expect(apiRef.current.getTheme()).toBeUndefined()
  })
})