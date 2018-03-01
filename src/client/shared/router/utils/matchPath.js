import pathToRegexp from 'path-to-regexp';

const patternCache = {};
const cacheLimit = 200;
let cacheCount = 0;

function getCacheKey(path, exact) {
  return `${path}-${exact}`;
}

function compilePattern(path, exact) {
  const cacheKey = getCacheKey(path, exact);

  if (patternCache[cacheKey]) {
    return patternCache[cacheKey];
  }

  const keys = [];
  const options = { end: exact };
  const re = pathToRegexp(path, keys, options);
  const pattern = { re, keys };

  if (cacheCount < cacheLimit) {
    patternCache[cacheKey] = pattern;
    cacheCount += 1;
  }

  return pattern;
}

// Returns match if found or null
function matchPath(pathname, path, exact = false) {
  const { re, keys } = compilePattern(path, exact);

  const match = re.exec(pathname);

  if (match === null) {
    return null;
  }

  return {
    // path to match
    path,
    // url that matched
    url: match[0],
    isExact: exact,
    params: keys.reduce((params, key, index) => ({
      ...params,
      [key.name]: match[index + 1],
    }), {}),
  };
}

export default matchPath;
