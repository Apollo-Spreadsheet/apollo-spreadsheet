import {StretchMode} from "./stretch-mode.enum"
import {HeadersData} from "./types/header.type";
import {GridTheme} from "../types/grid-theme";
import {NavigationCoords} from "../navigation/types/navigation-coords.type";

export interface ColumnGridProps {
	/** @default StretchMode.None  */
	stretchMode?: StretchMode
	headers: HeadersData;
	className: string;
	minRowHeight: number;
	columnWidth: number;
	autoHeight: boolean;
	width: number;
	scrollLeft: number;
	isScrolling: boolean;
	onScroll: Function;
	height: number;
	theme?: GridTheme;
	coords: NavigationCoords;
}