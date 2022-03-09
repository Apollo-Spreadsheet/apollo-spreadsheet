import React, { useState } from 'react'
import { Box, Grid } from '@material-ui/core'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, CellChangeParams } from '../../../src'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { useNoScrollTheme } from '../../theme/useNoScrollTheme'

interface GroupRow {
  id: string
  name: string
  name2?: string
  name3?: string
  city: string
  city2?: string
  city3?: string
  city4?: string
  country: string
  job: string
  // order: number
  __children?: GroupRow[]
}

interface SingleRow {
  order: number
}

const generateRows = count => {
  return new Array(count).fill(true).map((_, i) => ({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    name2: faker.name.findName(),
    name3: faker.name.findName(),
    city: faker.address.city(),
    city2: faker.address.city(),
    city3: faker.address.city(),
    city4: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    //  order: i + 1,
  }))
}

const generateFirstRows = count => {
  return new Array(count).fill(true).map((_, i) => ({
    order: i + 1,
  }))
}

export function ColumnTwo() {
  const theme = useNoScrollTheme()
  const [firstRows, setFirstRows] = useState<SingleRow[]>(() => {
    return generateFirstRows(30)
  })
  const [rows, setRows] = useState<GroupRow[]>(() => {
    return generateRows(30)
  })
  const apiRef = useApiRef()
  const onHeaderIconClick = () => {
    const selectedRows = apiRef.current?.getSelectedRowIds() ?? []
    if (selectedRows.length === 0) {
      return
    }
    setRows(rows.filter(e => !selectedRows.some(id => id === e.id)))
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

  const firstHeader: Column[] = [
    {
      id: 'order',
      title: '',
      accessor: 'order',
      readOnly: true,
      tooltip: 'Create your new row',
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
    },
  ]

  const headers: Column[] = [
    {
      id: 'name',
      title: 'Name',
      accessor: 'name',
      __children: [
        { id: 'name2', title: 'Name2', accessor: 'name2', width: 80 },
        { id: 'name3', title: 'Name3', accessor: 'name3', width: 80 },
      ],
      width: 250,
    },
    {
      id: 'city',
      title: 'City',
      accessor: 'city',
      __children: [
        { id: 'city2', title: 'City2', accessor: 'city2', width: 80 },
        { id: 'city3', title: 'City3', accessor: 'city3', width: 80 },
        { id: 'city4', title: 'City4', accessor: 'city4', width: 80 },
      ],
      width: 350,
    },
    {
      id: 'country',
      title: 'Country',
      accessor: 'country',
      width: 70,
    },
    {
      id: 'job',
      title: 'Job',
      accessor: 'job',
      width: 70,
    },
  ]

  const onCellChange = (params: CellChangeParams) => {
    const headersWithChildren: any = []

    const iterateThroughHeaders = (array: Column[]) => {
      array.forEach(e => {
        headersWithChildren.push(e)

        if (e.__children !== undefined && apiRef.current.isColumnExpanded(e.id)) {
          iterateThroughHeaders(e.__children)
        }
      })
    }
    iterateThroughHeaders(headers)
    const updateRow = prev => {
      const updatedRows = [...prev]

      const header = headersWithChildren[params.coords.colIndex]

      updatedRows.forEach(e => {
        if (e.id === (params.row as GroupRow).id) {
          e[header?.accessor] = params.newValue
        }
        if (e.__children !== undefined) {
          updateRow(e.__children)
        }
      })
      return updatedRows
    }
    setRows(prev => {
      return updateRow(prev)
    })
  }

  return (
    <Box width={'80%'} height={'calc(100vh - 100px)'}>
      <ApolloSpreadSheet
        apiRef={apiRef}
        columns={headers}
        rows={rows}
        onCellChange={onCellChange}
        onCreateRow={onCreateRowClick}
        minColumnWidth={10}
        fixedRowHeight
        fixedRowWidth
        rowHeight={30}
        theme={theme.theme}
        containerClassName={theme.containerClass}
        stretchMode={StretchMode.None}
        disableSort
        nestedRows
        nestedColumns
      />
    </Box>
  )
}
