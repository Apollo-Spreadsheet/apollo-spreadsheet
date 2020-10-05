export interface GetColumnWidthArgs {
	index: number
}

export interface GetColumnWidthFn {
	(args: GetColumnWidthArgs): number
}
