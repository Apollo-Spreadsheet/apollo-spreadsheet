import { getEditorComponent } from "../utils";
import { Column, ColumnCellType } from "../../columnGrid";
import { EditorProps } from "../editorProps";
import { useApiRef } from "../../api";
import { renderHook } from "@testing-library/react-hooks";
import { TextEditor } from "../components";
import React from "react";

describe('getEditorComponent util', () => {
  const row = {}
  it('should create with default type', () => {
    const { result: { current: apiRef } } = renderHook(() => useApiRef())
    const editorProps: EditorProps = {
      additionalProps: undefined,
      anchorRef: undefined as any,
      apiRef,
      maxLength: 0,
      stopEditing: jest.fn(),
      value: ""
    }
    const column: Column = { accessor: "", title: "", id: 'test', type: ColumnCellType.TextArea }
    const onRefMount = jest.fn()
    const result = getEditorComponent(row, column, editorProps, onRefMount)
    expect(React.isValidElement(result)).toEqual(true)
  })

  it('should create a component of type forwardRef', () => {
    const { result: { current: apiRef } } = renderHook(() => useApiRef())
    const editorProps: EditorProps = {
      additionalProps: undefined,
      anchorRef: undefined as any,
      apiRef,
      maxLength: 0,
      stopEditing: jest.fn(),
      value: ""
    }
    const column: Column = { accessor: "", title: "", id: 'test', editor: TextEditor }
    const onRefMount = jest.fn()
    const result = getEditorComponent(row, column, editorProps, onRefMount)
    expect(React.isValidElement(result)).toEqual(true)
  })
  it('should get editor from JSX.Element editor', () => {
    const { result: { current: apiRef } } = renderHook(() => useApiRef())
    const editorProps: EditorProps = {
      additionalProps: undefined,
      anchorRef: undefined as any,
      apiRef,
      maxLength: 0,
      stopEditing: jest.fn(),
      value: ""
    }
    const column: Column = { accessor: "", title: "", id: 'test', editor: <div>Test</div> }
    const onRefMount = jest.fn()
    const result = getEditorComponent(row, column, editorProps, onRefMount)
    expect(React.isValidElement(result)).toEqual(true)
  })

  it('should get editor from function factory editor', () => {
    const { result: { current: apiRef } } = renderHook(() => useApiRef())
    const editorProps: EditorProps = {
      additionalProps: undefined,
      anchorRef: undefined as any,
      apiRef,
      maxLength: 0,
      stopEditing: jest.fn(),
      value: ""
    }
    const factory = jest.fn().mockImplementation(() => {
      return <div>Test</div>
    })
    const column: Column = { accessor: "", title: "", id: 'test', editor: factory }
    const onRefMount = jest.fn()
    const result = getEditorComponent(row, column, editorProps, onRefMount)
    expect(React.isValidElement(result)).toEqual(true)
  })
})