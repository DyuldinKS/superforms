// find object value by path
export default function deepFind(obj, path) {
	const keys = path.split('.');
	let current = obj;

	for (let i = 0; i < keys.length; i += 1) {
		if (keys[i] in current) {
			current = current[keys[i]];
		} else {
			return undefined;
		}
	}
	return current;
}
