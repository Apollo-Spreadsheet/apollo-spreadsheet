import React, { useMemo } from 'react'
import { Box, Typography } from '@material-ui/core'
import { ApolloSpreadSheet, Column, StretchMode } from '../../../src'

export const NoContentTableExample: React.FC = () => {
  const columns: Column[] = useMemo(
    () => [
      {
        id: 'order',
        title: '',
        accessor: 'order',
        width: '3%',
        readOnly: true,
        disableCellCut: true,
        disableCellPaste: true,
      },
      {
        id: 'name',
        title: 'Name',
        accessor: 'name',
        width: '25%',
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

  const renderOverlay = () => {
    return (
      <Box
        height={500}
        width="100%"
        justifyContent={'center'}
        display={'flex'}
        textAlign={'center'}
        alignContent={'center'}
      >
        <Typography variant={'h6'}>No rows</Typography>
      </Box>
    )
  }
  return (
    <ApolloSpreadSheet
      rows={[]}
      height={500}
      width={1080}
      columns={columns}
      noContentOverlay={renderOverlay}
      stretchMode={StretchMode.All}
    />
  )
}
