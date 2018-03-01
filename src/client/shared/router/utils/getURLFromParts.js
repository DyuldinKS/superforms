export default function getURLFromParts(parts) {
  const {
    pathname = '',
    search = {},
    hash = '',
  } = parts;
  let url = pathname;

  let searchString = Object.keys(search).reduce((acc, key) => {
    const value = search[key];
    return (!value || value.length === 0) ?
      acc :
      acc.concat(`${key}=${value}&`);
  }, '');

  if (searchString.length !== 0) {
    searchString = searchString.slice(0, -1); // remove last '&' char
    url = url.concat(`?${searchString}`);
  }

  if (hash.length !== 0) {
    url = url.concat(`#${hash}`);
  }

  return encodeURI(url);
}
