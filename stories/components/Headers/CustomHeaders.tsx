import { Box, IconButton, Theme } from '@material-ui/core'
import React, { useCallback, useMemo, useState } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import PersonIcon from '@material-ui/icons/Person'
import MailIcon from '@material-ui/icons/Mail'
import PublicIcon from '@material-ui/icons/Public'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef } from '../../../src'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) => ({
  iconBtn: {
    padding: 0,
    cursor: 'default',
    color: '#CCCCCC',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}))

interface CustomRows {
  id: string
  order: number
  name: string
  country: string
  email: string
}

const generateFakeData = () => {
  const entries = 49
  const rows: CustomRows[] = []
  for (let i = 0; i <= entries; i++) {
    rows.push({
      id: faker.datatype.uuid(),
      order: i + 1,
      name: faker.name.findName(),
      country: faker.address.country(),
      email: faker.internet.email(),
    })
  }
  return rows
}

export function CustomHeaders() {
  const classes = useStyles()
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
        country: '',
        email: '',
      },
    ])
    const { colIndex } = apiRef.current.getSelectedCoords()
    const rowCount = apiRef.current.getRowsCount()
    apiRef.current.selectCell({ colIndex, rowIndex: rowCount - 1 })
  }, [apiRef])

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
        title: '',
        accessor: 'name',
        tooltip: 'Name',
        width: '20%',
        renderer: () => {
          return (
            <IconButton disabled className={classes.iconBtn}>
              <PersonIcon />
            </IconButton>
          )
        },
      },
      {
        id: 'country',
        title: '',
        accessor: 'country',
        tooltip: 'Country',
        width: '20%',
        renderer: () => {
          return (
            <IconButton disabled className={classes.iconBtn}>
              <PublicIcon />
            </IconButton>
          )
        },
      },
      {
        id: 'email',
        title: '',
        accessor: 'email',
        tooltip: 'E-mail Adress',
        width: '20%',
        renderer: () => {
          return (
            <IconButton disabled className={classes.iconBtn}>
              <MailIcon />
            </IconButton>
          )
        },
      },
    ],
    [classes.iconBtn, onCreateRowClick],
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
        disableSort
      />
    </Box>
  )
}
