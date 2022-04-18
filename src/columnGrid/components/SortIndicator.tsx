import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import React, { memo } from 'react'
import { SortOrder } from '../types'

interface Props {
  order?: SortOrder
}

export const SortIndicator: React.FC<Props> = memo(({ order }) => {
  if (!order) {
    return null
  }
  const iconProps = {
    style: { fontSize: '10px' },
    display: 'flex',
  }

  return order === 'asc' ? <ArrowUpwardIcon {...iconProps} /> : <ArrowDownwardIcon {...iconProps} />
})
