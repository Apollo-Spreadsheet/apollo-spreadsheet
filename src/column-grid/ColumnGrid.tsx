import React, {
	useRef,
	useEffect,
	useMemo,
	useCallback,
	useImperativeHandle,
	forwardRef,
} from "react";
import {Grid, CellMeasurerCache} from "react-virtualized";
import CellMeasurer from "../core/CellMeasureWrapper";
import useLazyRef from "../hooks/useLazyRef";
import {Column} from "./types/header.type";
import {insertDummyCells} from "../utils/helpers";
import clsx from "clsx";
import {ColumnGridProps} from "./column-grid-props";

const ColumnGrid = React.memo(
  forwardRef((props: ColumnGridProps, componentRef) => {
	  const {current: cache} = useLazyRef(
		() =>
		  new CellMeasurerCache({
			  defaultWidth: props.defaultColumnWidth,
			  defaultHeight: props.minRowHeight,
			  fixedWidth: true,
			  minHeight: props.minRowHeight,
			  //We might use another approach in here
			  minWidth: props.defaultColumnWidth,
		  })
	  );

	  useImperativeHandle(componentRef, () => ({
		  recomputeGridSize: () => {
			  gridRef.current?.recomputeGridSize();
		  },
		  forceUpdate: () => {
			  gridRef.current?.forceUpdate();
		  },
	  }));
	  const gridRef = useRef<Grid | null>(null);

	  const data = useMemo(() => {
		  return insertDummyCells(props.headers);
	  }, [props.headers]);

	  // clear cache and recompute when data changes
	  useEffect(() => {
		  cache?.clearAll();
		  gridRef.current?.recomputeGridSize();
	  }, [data]);


	  const headerRendererWrapper = useCallback(
		({style, cell, ref, columnIndex, rowIndex}) => {
			const {title, renderer} = cell as Column;
			/** @todo Cache cell renderer result because if may have not changed so no need to invoke again **/
			const children = renderer ? (renderer(cell) as any) : title;

			return (
			  <div
				ref={ref}
				/** @todo We ensure its the first rowIndex to avoid nested getting this but i have to discuss with Pedro **/
				className={
					props.coords.colIndex === columnIndex && rowIndex === 0
					  ? clsx(
					  props.theme?.headerClass,
					  props.theme?.currentColumnClass
					  )
					  : props.theme?.headerClass
				}
				style={{
					display: "flex",
					justifyContent: "center",
					padding: "5px",
					boxSizing: "border-box",
					background: "#efefef",
					border: "1px solid #ccc",
					cursor: "default",
					...style,
				}}
			  >
				  {children}
			  </div>
			);
		},
		[props.coords, props.theme, props.width]
	  );

	  const cellMeasurerWrapperRenderer = useCallback(
		(args) => {
			const cell = data[args.rowIndex]?.[args.columnIndex];
			if (!cell) {
				return null;
			}
			const style = {
				...args.style,
				...cell["style"],
				width: props.getColumnWidth({index: args.columnIndex}),
				userSelect: "none",
			};

			const rendererProps = {
				...args,
				cell,
			};
			return (
			  <CellMeasurer
				cache={cache}
				columnIndex={args.columnIndex}
				key={args.key}
				parent={args.parent}
				rowIndex={args.rowIndex}
				rowSpan={cell.rowSpan}
				colSpan={cell.colSpan}
				cellRenderer={headerRendererWrapper}
				rendererProps={rendererProps}
				style={style}
			  />
			);
		},
		[data, props.theme, props.coords, props.width]
	  );

	  const columnCount = useMemo(() => {
		  return data.length ? data[0].length : 0;
	  }, [data]);

	  const onRefMount = useCallback((instance) => {
		  gridRef.current = instance;
	  }, []);

	  return (
		<Grid
		  {...(props as any)}
		  ref={onRefMount}
		  cellRenderer={cellMeasurerWrapperRenderer}
		  deferredMeasurementCache={cache}
		  rowHeight={cache.rowHeight}
		  rowCount={data.length}
		  columnCount={columnCount}
		  overscanRowCount={2}
		  overscanColumnCount={2}
		  width={props.width}
		  columnWidth={props.getColumnWidth}
		  autoHeight
		/>
	  );
  })
);

export default ColumnGrid;
