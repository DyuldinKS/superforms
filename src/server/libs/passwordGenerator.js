
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


const allSources = Object.values(source)
	.reduce((prev, src) => `${prev}${src}`, '');


const generate = (min = 12, max) => {
	const sources = Object.values(source);
	const chars = sources.map(pickChar);

	if(min > sources.length) {
		const passLength = max && max > min ? getRandomInt(min, max + 1) : min;
		Array.from(Array(passLength - sources.length)).forEach(() => {
			chars.push(allSources.charAt(getRandomInt(0, allSources.length)));
		});
	}

	return shuffle(chars).join('');
};


export default generate;

