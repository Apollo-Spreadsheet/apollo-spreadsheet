import {StretchMode} from "../types/stretch-mode.enum"
import {HeadersData} from "./types/header.type";
import {GridTheme} from "../types/grid-theme";
import {NavigationCoords} from "../navigation/types/navigation-coords.type";

export interface ColumnGridProps {
	headers: HeadersData;
	className?: string;
	minRowHeight: number;

	defaultColumnWidth: number
	getColumnWidth: ({index}: { index: number}) => number;

	width: number;
	scrollLeft: number;
	isScrolling: boolean;
	onScroll: Function;
	height: number;
	theme?: GridTheme;
	coords: NavigationCoords;
	/** @default StretchMode.None  */
	stretchMode?: StretchMode
}