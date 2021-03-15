import React, { useCallback, useState } from 'react'
import { ApolloSpreadSheet, StretchMode } from '../../../src'
import { Column } from '../../../src/columnGrid/types/header.type'
import { AddCircle } from '@material-ui/icons'
import { Box, IconButton } from '@material-ui/core'
import { CellChangeParams } from '../../../src/editorManager/useEditorManager'
import { useApiRef } from '../../../src/api/useApiRef'
import faker from 'faker'
import { makeStyles } from '@material-ui/core/styles'

interface DemoRow {
  id: string
  name: string
  city: string
  country: string
  job: string
  order: number
}

const generateRows = count => {
  return new Array(count).fill(true).map((_, i) => ({
    id: faker.random.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.company.bs(),
    order: i + 1,
  }))
}
const useStyles = makeStyles(() => ({
  cell: {},
  selectedCell: {
    background: '#004daa',
    color: 'white',
  },
}))

export function Table() {
  const classes = useStyles()
  const [rows, setRows] = useState<DemoRow[]>(generateRows(15))
  const apiRef = useApiRef()
  const onHeaderIconClick = () => {
    const selectedRows = apiRef.current?.getSelectedRowIds() ?? []
    if (selectedRows.length === 0) {
      return
    }
    setRows(rows.filter(e => !selectedRows.some(id => id === e.id)))
  }

  function disableSort(header: Column) {
    return header.id === 'order'
  }
  const onCellChange = (params: CellChangeParams) => {
    setRows(prev => {
      const updatedRows = [...prev]
      const header = headers[params.coords.colIndex]
      updatedRows[params.coords.rowIndex] = {
        ...updatedRows[params.coords.rowIndex],
        [header?.accessor]: params.newValue,
      }
      return updatedRows
    })
  }

  const onCreateRowClick = () => {
    setRows(prev => [
      ...prev,
      {
        id: `r-${Math.random()}`,
        name: '',
        city: '',
        country: '',
        job: '',
        order: prev.length + 1,
      },
    ])
    const { colIndex } = apiRef.current.getSelectedCoords()
    const rowCount = apiRef.current.getRowsCount()
    apiRef.current.selectCell({ colIndex, rowIndex: rowCount - 1 })
  }

  const headers: Column[] = [
    {
      id: 'order',
      title: '',
      accessor: 'order',
      readOnly: true,
      tooltip: 'Create your new row',
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
      width: '3%',
      renderer: () => {
        return (
          <IconButton onClick={onCreateRowClick}>
            <AddCircle />
          </IconButton>
        )
      },
    },
    {
      id: 'name',
      title: 'Name',
      accessor: 'name',
      width: '20%',
    },
    {
      id: 'city',
      title: 'City',
      accessor: 'city',
      width: '20%',
    },
    {
      id: 'country',
      title: 'Country',
      accessor: 'country',
      width: '35%',
    },
    {
      id: 'org',
      title: 'Organization',
      accessor: 'org',
      width: '20%',
    },
  ]

  return (
    <Box width={'98%'} height={'calc(100vh - 100px)'} style={{ margin: 10 }}>
      <ApolloSpreadSheet
        apiRef={apiRef}
        columns={headers}
        rows={rows}
        onCellChange={onCellChange}
        onCreateRow={onCreateRowClick}
        minColumnWidth={10}
        minRowHeight={30}
        stretchMode={StretchMode.All}
        selection={{
          key: 'id',
          onHeaderIconClick,
          cellClassName: classes.selectedCell,
        }}
        disableSort={disableSort}
        // nestedHeaders={[
        // 	[
        // 		{
        // 			title: 'Nested header example',
        // 			colSpan: 5,
        // 		},
        // 	],
        // ]}
      />
    </Box>
  )
}
