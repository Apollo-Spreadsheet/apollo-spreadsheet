export default function shallowDiffers(prev: Object, next: Object): boolean {
	for (let attribute in prev) {
		if (!(attribute in next)) {
			return true;
		}
	}
	for (let attribute in next) {
		if (prev[attribute] !== next[attribute]) {
			return true;
		}
	}
	return false;
}