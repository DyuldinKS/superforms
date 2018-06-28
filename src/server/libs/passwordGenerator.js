
const getRandomInt = (min, max) => (
	Math.floor(Math.random() * (max - min)) + min
);


const pickChar = str => str[getRandomInt(0, str.length)];


const shuffle = (arr) => {
	let temp;
	let random;

	for (let curr = arr.length; curr > 0; curr -= 1) {
		random = getRandomInt(0, arr.length);
		temp = arr[random];
		arr[random] = arr[curr];
		arr[curr] = temp;
	}

	return arr;
};


const source = {
	specials: '!@#$%*?',
	lowercase: 'abcdefghijklmnopqrstuvwxyz',
	uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numbers: '0123456789',
};


const generate = (min = 8, max, srcTypes = 'all') => {
	const sources = srcTypes === 'all'
		? Object.values(source)
		: srcTypes.map(type => source[type]).filter(values => values);

	const summaryLine = sources.join('');

	const chars = sources.map(pickChar);

	if(min > sources.length) {
		const passLength = max && (max > min) ? getRandomInt(min, max + 1) : min;
		for (let i = sources.length; i < passLength; i += 1) {
			chars.push(pickChar(summaryLine));
		}
	}

	return shuffle(chars).join('');
};


export default generate;
