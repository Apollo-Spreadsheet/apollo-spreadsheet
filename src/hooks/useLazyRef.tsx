import {useRef} from "react";

/**
 * Creates a ref using `useRef` hook that is initialized by a function later on
 * @example Used for cache construction with react-virtualized
 * @param func
 */
export function useLazyRef<T = any>(func: () => T){
	const ref = useRef<T | null>(null);

	if (!ref.current) {
		ref.current = func();
	}
	return ref;
}

export default useLazyRef