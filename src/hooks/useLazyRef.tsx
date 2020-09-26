import {useRef} from "react";

export function useLazyRef<T = any>(func: Function){
	const ref = useRef<T | null>(null);

	if (!ref.current) {
		ref.current = func();
	}
	return ref;
}

export default useLazyRef