import React, { useRef, useState } from 'react'
import { Box, Grid, Theme } from '@material-ui/core'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, CellChangeParams } from '../../../src'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) => ({
  scroll: {
    overflow: 'hidden',
    overflowY: 'hidden',
  },
}))

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

export function BudgetTest() {
  const [firstRows, setFirstRows] = useState<SingleRow[]>(() => {
    return generateFirstRows(30)
  })
  const [rows, setRows] = useState<GroupRow[]>(() => {
    return generateRows(30)
  })
  const apiRef = useApiRef()
  const apiRef2 = useApiRef()

  const useScrollRef = useRef()
  const classes = useStyles()
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
        { id: 'name2', title: 'Name2', accessor: 'name2', width: 120 },
        { id: 'name3', title: 'Name3', accessor: 'name3', width: 120 },
      ],
      width: 250,
    },
    {
      id: 'city',
      title: 'City',
      accessor: 'city',
      __children: [
        { id: 'city2', title: 'City2', accessor: 'city2', width: 120 },
        { id: 'city3', title: 'City3', accessor: 'city3', width: 120 },
        { id: 'city4', title: 'City4', accessor: 'city4', width: 120 },
      ],
      width: 350,
    },
    {
      id: 'country',
      title: 'Country',
      accessor: 'country',
      width: 140,
    },
    {
      id: 'job',
      title: 'Job',
      accessor: 'job',
      width: 100,
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
    <Grid container style={{ display: 'inline-flex' }}>
      <Box width={'20%'} height={'calc(100vh - 100px)'} style={{ marginRight: -14 }}>
        <ApolloSpreadSheet
          apiRef={apiRef}
          columns={firstHeader}
          rows={firstRows}
          minColumnWidth={10}
          fixedRowHeight
          fixedRowWidth
          rowHeight={30}
          stretchMode={StretchMode.All}
          disableSort
          nestedRows
          nestedColumns
          id={'grid1'}
          connectToIds={['grid2']}
        />
      </Box>
      <Box width={'80%'} height={'calc(100vh - 100px)'}>
        <ApolloSpreadSheet
          apiRef={apiRef2}
          columns={headers}
          rows={rows}
          onCellChange={onCellChange}
          onCreateRow={onCreateRowClick}
          minColumnWidth={10}
          fixedRowHeight
          fixedRowWidth
          rowHeight={30}
          stretchMode={StretchMode.None}
          disableSort
          nestedRows
          nestedColumns
          id={'grid2'}
          connectToIds={['grid1']}
        />
      </Box>
    </Grid>
  )
}
