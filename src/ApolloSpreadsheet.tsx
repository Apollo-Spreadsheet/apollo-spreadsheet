import React, { forwardRef, useCallback, useRef, useState } from 'react'
import GridWrapper from './gridWrapper/GridWrapper'
import ColumnGrid from './columnGrid/ColumnGrid'
import { useNavigation } from './navigation/useNavigation'
import { StretchMode } from './types/stretch-mode.enum'
import { useMergeCells } from './mergeCells/useMergeCells'
import { useHeaders } from './columnGrid/useHeaders'
import { useData } from './data/useData'
import { useRowSelection } from './rowSelection/useRowSelection'
import { ClickAwayListener, useForkRef } from '@material-ui/core'
import { useEditorManager } from './editorManager/useEditorManager'
import { createPortal } from 'react-dom'
import { GridContainer } from './gridContainer/GridContainer'
import { useApiRef } from './api/useApiRef'
import { useApiFactory } from './api/useApiFactory'
import { makeStyles } from '@material-ui/core/styles'
import { useEvents } from './events/useEvents'
import { useApiEventHandler } from './api/useApiEventHandler'
import { CELL_CLICK, CELL_DOUBLE_CLICK } from './api/eventConstants'
import { ApolloSpreadsheetProps } from './ApolloSpreadsheetProps'
import { useSort } from './sort/useSort'
import { useLogger } from "./logger"

const useStyles = makeStyles(() => ({
	root: {
		height: '100%',
		width: '100%',
	},
}))

export const ApolloSpreadSheet = forwardRef(
	(props: ApolloSpreadsheetProps, componentRef: React.Ref<HTMLDivElement>) => {
		const logger = useLogger('ApolloSpreadSheet')
		const classes = useStyles()
		const minColumnWidth = props.minColumnWidth ?? 30
		const [gridFocused, setGridFocused] = useState(true)
		const defaultApiRef = useApiRef()
		const apiRef = React.useMemo(() => (!props.apiRef ? defaultApiRef : props.apiRef), [
			props.apiRef,
			defaultApiRef,
		])
		const rootContainerRef = useRef<HTMLDivElement>(null)
		const forkedRef = useForkRef(rootContainerRef, componentRef)
		const initialised = useApiFactory(rootContainerRef, apiRef, props.theme)

		useEvents(rootContainerRef, apiRef)

		const { gridHeaders, columns } = useHeaders({
			columns: props.columns,
			nestedHeaders: props.nestedHeaders,
			minColumnWidth,
			apiRef,
			initialised,
		})

		useMergeCells({
			mergeCells: props.mergeCells,
			rowCount: props.rows.length,
			columnCount: columns.length,
			apiRef,
			initialised,
		})

		const { cells, rows } = useData({
			rows: props.rows,
			columns: columns,
			selection: props.selection,
			apiRef,
			initialised,
		})

		useSort(apiRef, initialised)

		const coords = useNavigation({
			defaultCoords: props.defaultCoords ?? {
				rowIndex: 0,
				colIndex: 0,
			},
			suppressControls: props.suppressNavigation || !gridFocused,
			onCellChange: props.onCellChange,
			onCreateRow: props.onCreateRow,
			apiRef,
			initialised,
		})

		useRowSelection(apiRef, initialised, props.selection)

		const editorNode = useEditorManager({
			onCellChange: props.onCellChange,
			apiRef,
			initialised,
		})

		const onClickAway = useCallback(() => {
			if (!gridFocused) {
				return
			}
			if (props.outsideClickDeselects) {
				logger.debug('Grid click away detected.')
				setGridFocused(false)
				apiRef.current.selectCell({
					rowIndex: -1,
					colIndex: -1,
				})
			}
		}, [props.outsideClickDeselects, apiRef, gridFocused])

		//Detect if any element is clicked again to enable focus
		const onCellMouseHandler = useCallback(() => {
			if (!gridFocused) {
				logger.debug('Grid focus restored.')
				setGridFocused(true)
			}
		}, [gridFocused])

		useApiEventHandler(apiRef, CELL_CLICK, onCellMouseHandler)
		useApiEventHandler(apiRef, CELL_DOUBLE_CLICK, onCellMouseHandler)

		return (
			<ClickAwayListener onClickAway={onClickAway}>
				<div ref={forkedRef} className={classes.root}>
					<GridContainer
						columns={columns}
						minColumnWidth={minColumnWidth}
						stretchMode={props.stretchMode ?? StretchMode.All}
						containerClassName={props.containerClassName}
					>
						{({
							scrollLeft,
							onScroll,
							getColumnWidth,
							width,
							columnGridRef,
							height,
							mainGridRef,
						}) => (
							<div id="apollo-grids" className={props.className}>
								<ColumnGrid
									data={gridHeaders}
									coords={coords}
									columns={columns}
									width={width}
									defaultColumnWidth={minColumnWidth}
									getColumnWidth={getColumnWidth}
									ref={columnGridRef}
									minRowHeight={props.minColumnHeight ?? 50}
									scrollLeft={scrollLeft}
									stretchMode={props.stretchMode}
									nestedHeaders={props.nestedHeaders}
									overscanColumnCount={props.overscanColumnCount}
									overscanRowCount={props.overscanRowCount}
									disableSort={props.disableSort}
									apiRef={apiRef}
								/>
								<GridWrapper
									rows={rows}
									data={cells}
									coords={coords}
									overscanColumnCount={props.overscanColumnCount}
									overscanRowCount={props.overscanRowCount}
									defaultColumnWidth={minColumnWidth}
									width={width}
									getColumnWidth={getColumnWidth}
									minRowHeight={props.minRowHeight ?? 50}
									ref={mainGridRef}
									scrollLeft={scrollLeft}
									onScroll={onScroll}
									height={height}
									columnCount={columns.length}
									columns={columns}
									suppressNavigation={props.suppressNavigation}
									outsideClickDeselects={props.outsideClickDeselects}
									onCellChange={props.onCellChange}
									stretchMode={props.stretchMode ?? StretchMode.All}
									apiRef={apiRef}
									scrollToAlignment={props.scrollToAlignment}
									highlightBorderColor={props.highlightBorderColor}
									selection={props.selection}
								/>
							</div>
						)}
					</GridContainer>
					{editorNode && createPortal(editorNode, document.body)}
				</div>
			</ClickAwayListener>
		)
	},
)

export default ApolloSpreadSheet
