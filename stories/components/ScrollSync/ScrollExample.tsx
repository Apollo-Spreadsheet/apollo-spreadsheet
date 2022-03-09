import React, { useEffect, useRef, useState } from 'react'
import { Box, Grid } from '@material-ui/core'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, CellChangeParams } from '../../../src'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { OnScrollParams } from 'react-virtualized'

interface GroupRow {
  id: string
  name: string
  name2?: string
  city: string
  city2?: string
  country: string
  job: string
  order: number
  __children?: GroupRow[]
}

const generateRows = count => {
  const rows: GroupRow[] = new Array(count).fill(true).map((_, i) => ({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    order: i + 1,
  }))

  rows[1].id = '9X'
  //Add on the second row a collapse
  rows[1].__children = [
    {
      id: '8X',
      name: faker.name.findName(),
      city: faker.address.city(),
      country: faker.address.country(),
      job: faker.name.jobType(),
      order: 2.1,
      __children: [
        {
          id: faker.datatype.number().toString(),
          name: faker.name.findName(),
          city: faker.address.city(),
          country: faker.address.country(),
          job: faker.name.jobType(),
          order: 2.2,
          __children: [
            {
              id: faker.datatype.number().toString(),
              name: faker.name.findName(),
              city: faker.address.city(),
              country: faker.address.country(),
              job: faker.name.jobType(),
              order: 2.3,
            },
            {
              id: faker.datatype.number().toString(),
              name: faker.name.findName(),
              city: faker.address.city(),
              country: faker.address.country(),
              job: faker.name.jobType(),
              order: 2.4,
            },
            {
              id: faker.datatype.number().toString(),
              name: faker.name.findName(),
              city: faker.address.city(),
              country: faker.address.country(),
              job: faker.name.jobType(),
              order: 2.5,
            },
          ],
        },
      ],
    },
  ]
  rows.push({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    order: 3,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        city: faker.address.city(),
        country: faker.address.country(),
        job: faker.name.jobType(),
        order: 3.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    order: 4,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        city: faker.address.city(),
        country: faker.address.country(),
        job: faker.name.jobType(),
        order: 4.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    order: 5,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        name2: faker.name.findName(),
        city: faker.address.city(),
        country: faker.address.country(),
        job: faker.name.jobType(),
        order: 5.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    city2: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    order: 6,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        city: faker.address.city(),
        country: faker.address.country(),
        job: faker.name.jobType(),
        order: 6.1,
      },
    ],
  })
  return rows
}

export function ScrollExample() {
  const [rows, setRows] = useState<GroupRow[]>(() => {
    return generateRows(2)
  })
  const divRef = useRef(null)
  const apiRef = useApiRef()
  const apiRef2 = useApiRef()

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
    },
    {
      id: 'name',
      title: 'Name',
      accessor: 'name',
      __children: [{ id: 'name2', title: 'Name2', accessor: 'name2' }],
    },
    {
      id: 'city',
      title: 'City',
      accessor: 'city',
      __children: [
        { id: 'city2', title: 'City2', accessor: 'city2' },
        { id: 'city3', title: 'City3', accessor: 'city3' },
      ],
    },
    {
      id: 'country',
      title: 'Country',
      accessor: 'country',
    },
    {
      id: 'job',
      title: 'Job',
      accessor: 'job',
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
  const onScroll = (e: OnScrollParams, div: string) => {
    const elementCore =
      div === '1'
        ? (document.getElementById('core-grid-right') as HTMLElement)
        : (document.getElementById('core-grid-left') as HTMLElement)
    console.log(elementCore.scrollTop)

    elementCore.scrollTo(0, e.scrollTop)
  }

  return (
    <div style={{ margin: 0 }}>
      <div style={{ margin: 0, height: '100px', width: '50%', float: 'left' }}>
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
          stretchMode={StretchMode.All}
          selection={{
            key: 'id',
            onHeaderIconClick,
          }}
          disableSort
          onScroll={e => onScroll(e, '1')}
          nestedRows
          nestedColumns
          coreId={'core-grid-left'}
        />
      </div>
      <div style={{ margin: 0, height: '100px', width: '50%', float: 'right' }}>
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
          stretchMode={StretchMode.All}
          selection={{
            key: 'id',
            onHeaderIconClick,
          }}
          disableSort
          onScroll={e => onScroll(e, '2')}
          nestedRows
          nestedColumns
          coreId={'core-grid-right'}
        />
      </div>
    </div>
  )
}
