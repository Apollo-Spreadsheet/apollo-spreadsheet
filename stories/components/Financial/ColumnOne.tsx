import React, { useState } from 'react'
import { Box, Grid, makeStyles } from '@material-ui/core'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, CellChangeParams } from '../../../src'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { useNoScrollTheme } from '../../theme/useNoScrollTheme'

const useStyles = makeStyles(theme => ({
  scroll: {
    overflow: 'hidden',
  },
}))

interface SingleRow {
  order: number
}

const generateFirstRows = count => {
  return new Array(count).fill(true).map((_, i) => ({
    order: i + 1,
  }))
}

export function ColumnOne() {
  const classes = useStyles()
  const theme = useNoScrollTheme()
  const [firstRows, setFirstRows] = useState<SingleRow[]>(() => {
    return generateFirstRows(30)
  })
  const apiRef = useApiRef()

  const firstHeader: Column[] = [
    {
      id: 'order',
      title: 'Sub Totals',
      accessor: 'order',
      readOnly: true,
      tooltip: 'Create your new row',
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
    },
  ]

  return (
    <Box width={'20%'} height={'calc(100vh - 100px)'} style={{ marginRight: -15 }}>
      <ApolloSpreadSheet
        apiRef={apiRef}
        columns={firstHeader}
        rows={firstRows}
        minColumnWidth={10}
        fixedRowHeight
        fixedRowWidth
        rowHeight={30}
        theme={theme.theme}
        containerClassName={theme.containerClass}
        stretchMode={StretchMode.All}
        disableSort
        nestedRows
        nestedColumns
      />
    </Box>
  )
}
