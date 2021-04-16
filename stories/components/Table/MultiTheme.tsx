import { Box, FormControl, InputLabel, makeStyles, MenuItem, Select } from '@material-ui/core'
import React, { useCallback, useMemo, useState } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef } from '../../../src'
import { useDarkModeTheme } from '../../theme/useDarkModeTheme'
import { useLightModeTheme } from '../../theme/useLightModeTheme'
import { useColoredTheme } from '../../theme/useColoredTheme'

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}))

interface CustomRows {
  id: string
  order: number
  name: string
  country: string
  address: string
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
      country: faker.address.country(),
      address: faker.address.streetAddress(),
      email: faker.internet.email(),
    })
  }
  return rows
}
//const rows = generateFakeData()

export function MultiTheme() {
  const classes = useStyles()
  const apiRef = useApiRef()
  const coloredTheme = useColoredTheme()
  const darkTheme = useDarkModeTheme()
  const lightTheme = useLightModeTheme()
  const themeRecord = [darkTheme, lightTheme, coloredTheme]

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
        address: '',
        email: '',
      },
    ])
    const { colIndex } = apiRef.current.getSelectedCoords()
    const rowCount = apiRef.current.getRowsCount()
    apiRef.current.selectCell({ colIndex, rowIndex: rowCount - 1 })
  }, [apiRef])

  const [open, setOpen] = useState(false)
  const [activeThemeIndex, setActiveThemeIndex] = useState(0)

  const handleChange = useCallback(event => {
    setActiveThemeIndex(Number(event.target.value))
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleOpen = useCallback(() => {
    setOpen(true)
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
      },
      {
        id: 'name',
        title: 'Name',
        accessor: 'name',
        width: '20%',
      },
      {
        id: 'country',
        title: 'Country',
        accessor: 'country',
        width: '20%',
      },
      {
        id: 'address',
        title: 'Address',
        accessor: 'address',
        width: '20%',
      },
      {
        id: 'email',
        title: 'E-mail',
        accessor: 'email',
        width: '20%',
      },
    ],
    [],
  )

  return (
    <Box width={'100%'} height={'calc(100vh - 100px)'}>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-controlled-open-select-label">Select Theme</InputLabel>
        <Select
          labelId="demo-controlled-open-select-label"
          id="demo-controlled-open-select"
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          value={activeThemeIndex}
          onChange={handleChange}
        >
          <MenuItem value={0}>Dark Mode</MenuItem>
          <MenuItem value={1}>Light Mode</MenuItem>
          <MenuItem value={2}>Colored</MenuItem>
        </Select>
      </FormControl>
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
        theme={themeRecord[activeThemeIndex].theme}
        highlightBorderColor={'#5984C2'}
      />
    </Box>
  )
}
