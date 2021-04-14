import React from 'react'
import { OnScrollParams } from 'react-virtualized'
import {
  ApolloColumnRowSizeProps,
  ApolloCoreProps,
  ApolloDataProps,
  ApolloLayoutProps,
} from '../ApolloSpreadsheetProps'

export interface GridContainerChildrenProps {
  width: number
  height: number
  getColumnWidth: ({ index }: { index: number }) => number
  scrollLeft: number
  onScroll?: (params: OnScrollParams) => any
}

export interface GridContainerCommonProps {
  height?: React.ReactText
  width?: React.ReactText
  containerClassName?: string
}

export interface GridContainerProps
  extends GridContainerCommonProps,
    Required<ApolloCoreProps>,
    Required<Pick<ApolloLayoutProps, 'stretchMode'>>,
    Required<Pick<ApolloColumnRowSizeProps, 'minColumnWidth'>>,
    Pick<ApolloDataProps, 'columns'> {
  children: (props: GridContainerChildrenProps) => unknown
}
