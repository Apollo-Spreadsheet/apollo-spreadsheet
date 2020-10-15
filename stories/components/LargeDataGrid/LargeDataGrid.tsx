import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSimpleData } from './generateData'
import ApolloSpreadSheet from '../../../src'

export function LargeDataGrid() {
	const { headerData, data } = getSimpleData(50, 50)
	return (
		<ApolloSpreadSheet
			headers={headerData}
			rows={data}
			fixedColumnCount={2}
			onCellChange={console.log}
			minColumnWidth={120}
		/>
	)
}

export default LargeDataGrid
