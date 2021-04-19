import { Box, IconButton } from '@material-ui/core'
import React, { useCallback, useMemo, useState } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import {
  ApolloSpreadSheet,
  StretchMode,
  Column,
  useApiRef,
  ColumnCellType,
  CellEditorProps,
} from '../../../src'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import { CustomPopper } from './CustomPopper'
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd'

interface CustomRows {
  id: string
  order: number
  name: string
  age: number
  email: string
}

const generateFakeData = () => {
  const entries = 50
  const rows: CustomRows[] = []
  for (let i = 0; i <= entries; i++) {
    rows.push({
      id: faker.datatype.uuid(),
      order: i + 1,
      name: faker.name.findName(),
      age: faker.random.number(60),
      email: faker.internet.email(),
    })
  }
  return rows
}
//const rows = generateFakeData()

export function Editors() {
  const apiRef = useApiRef()
  const [rows, setRows] = useState<CustomRows[]>(() => {
    return generateFakeData()
  })

  const onCreateRowClick = useCallback(() => {
    setRows(prev => [
      ...prev,
      {
        id: `r-${Math.random()}`,
        order: prev.length + 1,
        name: '',
        age: 10,
        email: '',
      },
    ])
    const { colIndex } = apiRef.current.getSelectedCoords()
    const rowCount = apiRef.current.getRowsCount()
    apiRef.current.selectCell({ colIndex, rowIndex: rowCount - 1 })
  }, [apiRef])

  const customEditor = useCallback(({ onRefMount, editorProps }: CellEditorProps) => {
    return <CustomPopper ref={onRefMount} {...editorProps} />
  }, [])

  const columns: Column[] = useMemo(
    () => [
      {
        id: 'order',
        title: '',
        accessor: 'order',
        width: '5%',
        readOnly: true,
        disableCellCut: true,
        disableCellPaste: true,
        renderer: () => {
          return (
            <IconButton onClick={onCreateRowClick}>
              <AddCircleIcon />
            </IconButton>
          )
        },
      },
      {
        id: 'name',
        title: 'Client',
        accessor: 'name',
        tooltip: 'This editor only allows any input',
        width: '20%',
        type: ColumnCellType.TextArea,
      },
      {
        id: 'age',
        title: 'Age',
        accessor: 'age',
        tooltip: 'This editor only allows numerical',
        width: '5%',
        type: ColumnCellType.Numeric,
      },
      {
        id: 'custom',
        title: 'Client Details',
        accessor: 'custom',
        tooltip: 'This is a custom editor',
        width: 280,
        editor: customEditor,
        cellRenderer: () => {
          return (
            <IconButton disabled>
              <AssignmentIndIcon />
            </IconButton>
          )
        },
      },
      {
        id: 'date',
        title: 'Calendar',
        accessor: 'date',
        tooltip: 'Select a Date',
        width: '20%',
        type: ColumnCellType.Calendar,
      },
    ],
    [customEditor, onCreateRowClick],
  )

  return (
    <Box width={'100%'} height={'calc(100vh - 100px)'}>
      <ApolloSpreadSheet
        apiRef={apiRef}
        minColumnWidth={10}
        fixedRowHeight
        fixedRowWidth
        rowHeight={30}
        onCreateRow={onCreateRowClick}
        stretchMode={StretchMode.All}
        columns={columns}
        rows={rows}
      />
    </Box>
  )
}
