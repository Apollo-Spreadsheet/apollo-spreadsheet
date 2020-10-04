export default function shallowDiffers(prev: Object, next: Object): boolean {
	for (const attribute in prev) {
		if (!(attribute in next)) {
			return true
		}
	}
	for (const attribute in next) {
		if (prev[attribute] !== next[attribute]) {
			return true
		}
	}
	return false
}