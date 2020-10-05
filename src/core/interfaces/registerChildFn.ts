/**
 * React-virtualized requires this function in order to track the HTML element by registering it
 */
export interface RegisterChildFn {
	(element: Element): void
}
