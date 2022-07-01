import React, { useState } from 'react'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, CellChangeParams } from '../../../src'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { Box, Grid } from '@mui/material'
import dayjs from 'dayjs'
import { useLightModeTheme } from '../../theme/useLightModeTheme'

interface GroupRow {
  id: string
  name: string
  subtotals: string
  units: string
  name2?: string
  city: string
  city2?: string
  order: number
  __children?: GroupRow[]
}

const generateRows = count => {
  const rows: GroupRow[] = new Array(count).fill(true).map((_, i) => ({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    subtotals: faker.address.country(),
    units: faker.name.jobType(),
    order: i + 1,
  }))

  rows[1].id = '9X'
  //Add on the second row a collapse
  rows[1].__children = [
    {
      id: '8X',
      name: faker.name.findName(),
      city: faker.address.city(),
      subtotals: faker.address.country(),
      units: faker.name.jobType(),
      order: 2.1,
      __children: [
        {
          id: faker.datatype.number().toString(),
          name: faker.name.findName(),
          city: faker.address.city(),
          subtotals: faker.address.country(),
          units: faker.name.jobType(),
          order: 2.2,
          __children: [
            {
              id: faker.datatype.number().toString(),
              name: faker.name.findName(),
              city: faker.address.city(),
              subtotals: faker.address.country(),
              units: faker.name.jobType(),
              order: 2.3,
            },
            {
              id: faker.datatype.number().toString(),
              name: faker.name.findName(),
              city: faker.address.city(),
              subtotals: faker.address.country(),
              units: faker.name.jobType(),
              order: 2.4,
            },
            {
              id: faker.datatype.number().toString(),
              name: faker.name.findName(),
              city: faker.address.city(),
              subtotals: faker.address.country(),
              units: faker.name.jobType(),
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
    subtotals: faker.address.country(),
    units: faker.name.jobType(),
    order: 3,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        city: faker.address.city(),
        subtotals: faker.address.country(),
        units: faker.name.jobType(),
        order: 3.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    subtotals: faker.address.country(),
    units: faker.name.jobType(),
    order: 4,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        city: faker.address.city(),
        subtotals: faker.address.country(),
        units: faker.name.jobType(),
        order: 4.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    subtotals: faker.address.country(),
    units: faker.name.jobType(),
    order: 5,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        name2: faker.name.findName(),
        city: faker.address.city(),
        subtotals: faker.address.country(),
        units: faker.name.jobType(),
        order: 5.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    city2: faker.address.city(),
    subtotals: faker.address.country(),
    units: faker.name.jobType(),
    order: 6,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        city: faker.address.city(),
        subtotals: faker.address.country(),
        units: faker.name.jobType(),
        order: 6.1,
      },
    ],
  })
  return rows
}

export function Financial() {
  const [rows, setRows] = useState<GroupRow[]>(() => {
    return generateRows(2)
  })
  const apiRef = useApiRef()
  const apiRef2 = useApiRef()
  const apiRef3 = useApiRef()
  const apiRef4 = useApiRef()
  const useTheme = useLightModeTheme()

  const year = dayjs().year()
  const yearFormat = dayjs().format('YY')

  const year1 = dayjs().year(2023).format('YYYY')
  const year1Format = dayjs().year(2023).format('YY')

  const headerOne: Column[] = [
    {
      id: 'subtotals',
      title: 'Sub Totals',
      accessor: 'subtotals',
      readOnly: true,
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
      width: 150,
    },
    {
      id: 'units',
      title: 'Units',
      accessor: 'units',
      readOnly: true,
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
      width: 150,
    },
  ]

  const headerTwo: Column[] = [
    {
      id: 'year',
      title: year.toString(),
      accessor: 'year',
      width: 60,
      __children: [
        { id: `${year}-01`, title: `Jan ${yearFormat}`, accessor: `${year}-01`, width: 50 },
        { id: `${year}-02`, title: `Fev ${yearFormat}`, accessor: `${year}-02`, width: 50 },
        { id: `${year}-03`, title: `Mar ${yearFormat}`, accessor: `${year}-03`, width: 50 },
        { id: `${year}-04`, title: `Apr ${yearFormat}`, accessor: `${year}-04`, width: 50 },
        { id: `${year}-05`, title: `May ${yearFormat}`, accessor: `${year}-05`, width: 50 },
        { id: `${year}-06`, title: `Jun ${yearFormat}`, accessor: `${year}-06`, width: 50 },
        { id: `${year}-07`, title: `Jul ${yearFormat}`, accessor: `${year}-07`, width: 50 },
        { id: `${year}-08`, title: `Ago ${yearFormat}`, accessor: `${year}-08`, width: 50 },
        { id: `${year}-09`, title: `Sep ${yearFormat}`, accessor: `${year}-09`, width: 50 },
        { id: `${year}-10`, title: `Oct ${yearFormat}`, accessor: `${year}-10`, width: 50 },
        { id: `${year}-11`, title: `Nov ${yearFormat}`, accessor: `${year}-11`, width: 50 },
        { id: `${year}-12`, title: `Dez ${yearFormat}`, accessor: `${year}-12`, width: 50 },
      ],
    },
    {
      id: 'year+1',
      title: year1.toString(),
      accessor: 'year+1',
      width: 60,
      __children: [
        { id: `${year1}-01`, title: `Jan ${year1Format}`, accessor: `${year}-01`, width: 50 },
        { id: `${year1}-02`, title: `Fev ${year1Format}`, accessor: `${year}-02`, width: 50 },
        { id: `${year1}-03`, title: `Mar ${year1Format}`, accessor: `${year}-03`, width: 50 },
        { id: `${year1}-04`, title: `Apr ${year1Format}`, accessor: `${year}-04`, width: 50 },
        { id: `${year1}-05`, title: `May ${year1Format}`, accessor: `${year}-05`, width: 50 },
        { id: `${year1}-06`, title: `Jun ${year1Format}`, accessor: `${year}-06`, width: 50 },
        { id: `${year1}-07`, title: `Jul ${year1Format}`, accessor: `${year}-07`, width: 50 },
        { id: `${year1}-08`, title: `Ago ${year1Format}`, accessor: `${year}-08`, width: 50 },
        { id: `${year1}-09`, title: `Sep ${year1Format}`, accessor: `${year}-09`, width: 50 },
        { id: `${year1}-10`, title: `Oct ${year1Format}`, accessor: `${year}-10`, width: 50 },
        { id: `${year1}-11`, title: `Nov ${year1Format}`, accessor: `${year}-11`, width: 50 },
        { id: `${year1}-12`, title: `Dez ${year1Format}`, accessor: `${year}-12`, width: 50 },
      ],
    },
  ]

  const headerFour: Column[] = [
    {
      id: 'subtotals',
      title: 'Project Structure',
      accessor: 'subtotals',
      readOnly: true,
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
      width: 150,
    },
    {
      id: 'units',
      title: '€',
      accessor: 'units',
      readOnly: true,
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
      width: 150,
    },
  ]

  return (
    <Grid container display={'inline-flex'}>
      <Box width={'20%'} height={'200px'} style={{ marginRight: -14 }}>
        <ApolloSpreadSheet
          apiRef={apiRef}
          columns={headerOne}
          rows={rows}
          minColumnWidth={10}
          fixedRowHeight
          fixedRowWidth
          rowHeight={30}
          stretchMode={StretchMode.All}
          disableSort
          nestedColumns
          id={'grid1'}
          connectToIds={['grid2']}
          containerClassName={useTheme.containerClass}
          theme={useTheme.theme}
        />
      </Box>
      <Box width={'80%'} height={'200px'}>
        <ApolloSpreadSheet
          apiRef={apiRef2}
          columns={headerTwo}
          rows={rows}
          minColumnWidth={10}
          fixedRowHeight
          fixedRowWidth
          rowHeight={30}
          stretchMode={StretchMode.None}
          disableSort
          nestedColumns
          id={'grid2'}
          connectToIds={['grid1']}
          containerClassName={useTheme.containerClass}
          theme={useTheme.theme}
        />
      </Box>
      <Box width={'20%'} height={'calc(80vh - 100px)'} style={{ marginRight: -14 }}>
        <ApolloSpreadSheet
          apiRef={apiRef3}
          columns={headerOne}
          rows={rows}
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
          containerClassName={useTheme.containerClass}
          theme={useTheme.theme}
        />
      </Box>
      <Box width={'80%'} height={'calc(80vh - 100px)'}>
        <ApolloSpreadSheet
          apiRef={apiRef2}
          columns={headerTwo}
          rows={rows}
          minColumnWidth={10}
          fixedRowHeight
          fixedRowWidth
          rowHeight={30}
          stretchMode={StretchMode.None}
          disableSort
          //nestedRows
          nestedColumns
          id={'grid2'}
          connectToIds={['grid1']}
          containerClassName={useTheme.containerClass}
          theme={useTheme.theme}
        />
      </Box>
    </Grid>
  )
}
